import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TOTP implementation
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateSecret(length = 20): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

function base32Decode(str: string): Uint8Array {
  str = str.toUpperCase().replace(/=+$/, '');
  const output = [];
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of str) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      output.push((buffer >> bitsLeft) & 0xff);
    }
  }
  return new Uint8Array(output);
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

async function generateTOTP(secret: string, timeStep = 30, digits = 6): Promise<string> {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setBigUint64(0, BigInt(time));
  
  const hmac = await hmacSha1(key, new Uint8Array(timeBuffer));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = 
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

async function verifyTOTP(secret: string, code: string, window = 1): Promise<boolean> {
  // Check current time step and adjacent windows
  for (let i = -window; i <= window; i++) {
    const timeStep = 30;
    const time = Math.floor(Date.now() / 1000 / timeStep) + i;
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigUint64(0, BigInt(time));
    
    const key = base32Decode(secret);
    const hmac = await hmacSha1(key, new Uint8Array(timeBuffer));
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = 
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    
    const otp = (binary % Math.pow(10, 6)).toString().padStart(6, '0');
    if (otp === code) return true;
  }
  return false;
}

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    codes.push(code.slice(0, 4) + '-' + code.slice(4));
  }
  return codes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // GET /totp-2fa/status - Check 2FA status
    if (req.method === 'GET' && action === 'status') {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('is_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ 
          enabled: data?.is_enabled ?? false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /totp-2fa/setup - Generate new 2FA secret
    if (req.method === 'POST' && action === 'setup') {
      const secret = generateSecret();
      const email = user.email ?? 'user';
      const issuer = 'Chatter';
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

      // Store the secret (not enabled yet)
      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user.id,
          secret: secret,
          is_enabled: false,
          backup_codes: [],
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error storing 2FA secret:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to setup 2FA' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          secret,
          otpauthUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /totp-2fa/verify - Verify code and enable 2FA
    if (req.method === 'POST' && action === 'verify') {
      const { code } = await req.json();

      if (!code || code.length !== 6) {
        return new Response(
          JSON.stringify({ error: 'Invalid code format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's secret
      const { data: tfaData, error: tfaError } = await supabase
        .from('user_2fa')
        .select('secret, is_enabled')
        .eq('user_id', user.id)
        .single();

      if (tfaError || !tfaData) {
        return new Response(
          JSON.stringify({ error: '2FA not set up' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = await verifyTOTP(tfaData.secret, code);

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid code', valid: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If not already enabled, enable and generate backup codes
      if (!tfaData.is_enabled) {
        const backupCodes = generateBackupCodes();
        
        const { error: updateError } = await supabase
          .from('user_2fa')
          .update({
            is_enabled: true,
            backup_codes: backupCodes,
          })
          .eq('user_id', user.id);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to enable 2FA' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            valid: true, 
            enabled: true,
            backupCodes 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /totp-2fa/validate - Validate code during login (no auth required)
    if (req.method === 'POST' && action === 'validate') {
      const { userId, code } = await req.json();

      if (!userId || !code) {
        return new Response(
          JSON.stringify({ error: 'Missing userId or code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's secret using service role
      const { data: tfaData, error: tfaError } = await supabase
        .from('user_2fa')
        .select('secret, backup_codes')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .single();

      if (tfaError || !tfaData) {
        return new Response(
          JSON.stringify({ error: '2FA not enabled for this user' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check TOTP code
      const isValid = await verifyTOTP(tfaData.secret, code);
      
      if (isValid) {
        return new Response(
          JSON.stringify({ valid: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check backup codes
      const normalizedCode = code.toUpperCase().replace('-', '');
      const backupCodeIndex = tfaData.backup_codes.findIndex(
        (bc: string) => bc.replace('-', '') === normalizedCode
      );

      if (backupCodeIndex !== -1) {
        // Remove used backup code
        const newBackupCodes = [...tfaData.backup_codes];
        newBackupCodes.splice(backupCodeIndex, 1);
        
        await supabase
          .from('user_2fa')
          .update({ backup_codes: newBackupCodes })
          .eq('user_id', userId);

        return new Response(
          JSON.stringify({ valid: true, usedBackupCode: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /totp-2fa/disable - Disable 2FA
    if (req.method === 'POST' && action === 'disable') {
      const { code } = await req.json();

      // Get user's secret
      const { data: tfaData, error: tfaError } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', user.id)
        .single();

      if (tfaError || !tfaData) {
        return new Response(
          JSON.stringify({ error: '2FA not enabled' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = await verifyTOTP(tfaData.secret, code);

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete 2FA record
      const { error: deleteError } = await supabase
        .from('user_2fa')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Failed to disable 2FA' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ disabled: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /totp-2fa/check - Check if user has 2FA enabled (for login flow, no auth)
    if (req.method === 'POST' && action === 'check') {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('user_2fa')
        .select('is_enabled')
        .eq('user_id', userId)
        .eq('is_enabled', true)
        .maybeSingle();

      return new Response(
        JSON.stringify({ requires2FA: !!data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in totp-2fa function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
