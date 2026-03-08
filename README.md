# Karobar Sahulat - Web POS

Karobar Sahulat is a comprehensive business management system with Web POS and Mobile App integration for Pakistani small businesses. This Web POS component provides a complete point-of-sale solution with offline capability, thermal receipt printing, and seamless integration with the mobile app.

## Features

- **Offline Capability**: Works completely without internet connection
- **Product Management**: Search and add products to cart with real-time inventory tracking
- **Customer Management**: Optional customer name field with history tracking
- **Payment System**: Cash and Credit payment options
- **Thermal Receipt Printing**: Support for Bluetooth and USB thermal printers
- **Single Receipt Enforcement**: Ensures only one receipt is printed per transaction
- **Credit Management**: Track credit sales and sync with mobile app
- **Real-time Sync**: Automatically syncs data when internet connection is restored

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **API Communication**: Axios
- **Offline Storage**: Local storage/IndexedDB
- **Printer Integration**: Web Bluetooth API, ESC/POS commands
- **Backend**: Node.js/Express (shared with mobile app)
- **Database**: MongoDB (shared with mobile app)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd karobar-sahulat-web-pos
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── page.tsx         # Main POS dashboard
│   └── layout.tsx       # Global layout
├── components/          # Reusable UI components
│   ├── Cart.tsx         # Shopping cart component
│   ├── CustomerInfo.tsx # Customer information component
│   ├── PaymentMethod.tsx # Payment method component
│   ├── ProductSearch.tsx # Product search component
│   └── ReceiptPreview.tsx # Receipt preview component
├── services/            # API and business logic services
│   ├── apiService.ts    # API communication service
│   ├── offlineService.ts # Offline storage service
│   ├── salesService.ts  # Sales-related API calls
│   └── productService.ts # Product-related API calls
├── types/               # TypeScript type definitions
│   └── index.ts         # Type definitions
└── utils/               # Utility functions
    └── printerUtils.ts  # Thermal printer utilities
```

## Key Components

### POS Dashboard
The main interface with:
- Product search functionality
- Shopping cart management
- Customer information input
- Payment method selection
- Offline/online status indicator

### Thermal Printer Integration
- Supports Bluetooth and USB thermal printers
- ESC/POS command support for Pakistani thermal printers
- Single receipt enforcement logic
- Print status tracking

### Offline Functionality
- Sales data stored locally when offline
- Automatic sync when connection is restored
- Clear offline/online indicators
- Data consistency between online and offline modes

## API Integration

The Web POS communicates with the backend API for:
- Product management
- Sales creation and tracking
- Inventory updates
- Customer information
- Credit management

## Credit Management

- Mark sales as credit during checkout
- Track outstanding dues
- Sync credit sales with mobile app
- Update payment status from either platform

## Thermal Receipt Printing

The system supports thermal receipt printing with:
- Bluetooth and USB connectivity
- ESC/POS command compatibility
- Single receipt enforcement
- Receipt status tracking
- Support for common Pakistani thermal printer models (TS-80S/TS-80, Xprinter XP-Q200/XP-Q260, Zebra ZD620BT/ZD230)

## Offline-First Architecture

The Web POS is designed with offline capability as a core feature:
- All critical functions work without internet
- Sales data stored locally during offline periods
- Automatic synchronization when connection is restored
- Clear status indicators for online/offline mode
- Seamless transition between online and offline modes

## Integration with Mobile App

The Web POS integrates seamlessly with the mobile app:
- Shared backend database
- Real-time sync of sales and inventory
- Credit sales appear in mobile app "View Dues"
- Payment status updates across platforms
- Consistent data model between platforms

## Contributing

We welcome contributions to the Karobar Sahulat project. Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ for Pakistani small businesses.