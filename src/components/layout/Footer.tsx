export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">EventConnect</h3>
            <p className="text-sm text-muted-foreground">
              Connect through events and build meaningful relationships.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/dashboard" className="hover:text-primary">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/groups" className="hover:text-primary">
                  Groups
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-primary">
                  Events
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/60">Help Center (Coming Soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60">Contact Us (Coming Soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60">FAQ (Coming Soon)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground/60">Privacy Policy (Coming Soon)</span>
              </li>
              <li>
                <span className="text-muted-foreground/60">Terms of Service (Coming Soon)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EventConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

