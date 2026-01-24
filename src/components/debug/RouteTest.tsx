import { Link } from "react-router-dom";

export function RouteTest() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-background border border-border rounded-lg shadow-lg">
      <h3 className="font-semibold mb-2">Route Test</h3>
      <div className="space-y-2 text-sm">
        <Link to="/privacy" className="block text-blue-500 hover:underline">
          Test Privacy Policy
        </Link>
        <Link to="/terms" className="block text-blue-500 hover:underline">
          Test Terms of Service
        </Link>
        <a href="/privacy" className="block text-green-500 hover:underline">
          Direct Privacy Link
        </a>
        <a href="/terms" className="block text-green-500 hover:underline">
          Direct Terms Link
        </a>
      </div>
    </div>
  );
}
