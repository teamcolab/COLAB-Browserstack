// Pages configuration for visual regression testing
// Each page has a name and path (relative to the environment host)
const pages = [
  // Homepage
  { name: 'Homepage', path: '/' },
  // Help section
  { name: 'Help', path: '/help' },
  // Loans section
  { name: 'Loans', path: '/loans' },
  { name: 'Home Loans', path: '/loans/home-loans' },
  { name: 'Home Purchase', path: '/loans/home-loans/home-purchase' },
  { name: 'Personal Loan Options', path: '/loans/personal-loan-options' },
  { name: 'Personal Loans', path: '/loans/personal-loan-options/personal-loans' },
  // Why section
  { name: 'Why VACU', path: '/why-vacu' },
  { name: 'Rates', path: '/why-vacu/rates' },
  { name: 'Careers', path: '/why-vacu/about-us/careers' },
  { name: 'News and Events', path: '/why-vacu/about-us/news-and-events' },
  { name: 'Become a Member', path: '/why-vacu/become-a-member' },
  // Services section
  { name: 'Services', path: '/services' },
  { name: 'Online Banking', path: '/services/online-banking' },
  { name: 'Loan Payment Protection', path: '/services/insurance-protection/loan-payment-protection' },
  // Banking section
  { name: 'Banking', path: '/banking' },
  { name: 'Checking', path: '/banking/checking' },
  { name: 'Regular Checking', path: '/banking/checking/regular-checking' },
  { name: 'Savings', path: '/banking/savings' },
  { name: 'Regular Savings', path: '/banking/savings/regular-savings' },
  { name: 'Credit Cards', path: '/banking/credit-cards' },
  { name: 'VCU Black & Gold Mastercard', path: '/banking/credit-cards/vcu-black-and-gold-mastercard' },
  // Business section
  { name: 'Business Membership', path: '/business/business-membership' },
  { name: 'Forms and Applications', path: '/business/membership/forms-and-applications' },
  // Learn section URLs from behavior tests
  { name: 'Learn All Topics', path: '/learn/all-topics' },
  { name: 'Learn Budgeting Topic', path: '/learn/budgeting' },
  { name: 'Learn Budgeting Article', path: '/learn/budgeting/10-tips-for-saving-money' },
  { name: 'Learn Collections - Financial Success for Women', path: '/learn/collections/financial-success-for-women' },
  { name: 'Learn Author Page - Sabrina Guerin', path: '/learn/sabrina-guerin' },
];

export default pages;
