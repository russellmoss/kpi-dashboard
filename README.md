# 🍷 Milea Estate Vineyard - KPI Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.7-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

A modern, real-time KPI dashboard built for Milea Estate Vineyard to track business performance, staff metrics, and generate AI-powered insights. Uses MongoDB for data storage and Supabase for authentication.

## ✨ Features

### 📊 **Real-time KPI Tracking**
- **Revenue Analytics**: Track total revenue, average order value, and revenue trends
- **Guest Metrics**: Monitor total guests, conversion rates, and visitor patterns
- **Wine Sales**: Track wine bottle conversion rates and sales performance
- **Staff Performance**: Monitor individual staff member performance and productivity

### 🤖 **AI-Powered Insights**
- **Automated Analysis**: AI-generated insights on business performance
- **Trend Detection**: Identify patterns and anomalies in sales data
- **Predictive Analytics**: Forecast future performance based on historical data
- **Smart Recommendations**: Actionable suggestions for business improvement

### 📈 **Interactive Visualizations**
- **Dynamic Charts**: Real-time conversion rate charts and trend analysis
- **Performance Tables**: Detailed staff performance metrics
- **Date Range Filtering**: Flexible date selection for custom analysis periods
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🔄 **Data Synchronization**
- **Commerce7 Integration**: Automatic sync with Commerce7 POS system
- **Real-time Updates**: Live data synchronization and updates
- **Historical Data**: Complete historical data tracking and analysis
- **Backup & Recovery**: Robust data backup and recovery systems

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Supabase account (for authentication)
- Commerce7 API access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kpi-dashboard.git
   cd kpi-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string

   # Supabase Configuration (Authentication)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Commerce7 API
   COMMERCE7_API_KEY=your_commerce7_api_key
   COMMERCE7_CLIENT_ID=your_commerce7_client_id
   COMMERCE7_CLIENT_SECRET=your_commerce7_client_secret

   # AI Services
   ANTHROPIC_API_KEY=your_anthropic_api_key

   # Email & SMS Services
   RESEND_API_KEY=your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running and accessible
   # The app will automatically create collections as needed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
kpi-dashboard/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Main dashboard page
│   ├── admin/            # Admin panel
│   ├── staff/            # Staff management
│   └── api/              # API routes
│       ├── sync/         # Data synchronization
│       ├── insights/     # AI insights
│       ├── reports/      # Report generation
│       └── staff/        # Staff API endpoints
├── components/            # React components
│   ├── KPICard.tsx      # KPI display cards
│   ├── ConversionChart.tsx # Charts and graphs
│   ├── DateRangePicker.tsx # Date selection
│   ├── StaffPerformanceTable.tsx # Staff metrics
│   └── AIInsightsPanel.tsx # AI insights display
├── lib/                  # Utility libraries
│   ├── mongodb/         # MongoDB client
│   ├── supabase/        # Authentication client
│   ├── commerce7/       # Commerce7 integration
│   ├── ai/              # AI services
│   ├── email/           # Email services
│   └── twilio/          # SMS services
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🔌 API Documentation

### Data Synchronization Endpoints

#### `POST /api/sync/full`
Synchronizes all data from Commerce7 to the local database.

**Request:**
```bash
curl -X POST http://localhost:3000/api/sync/full
```

**Response:**
```json
{
  "success": true,
  "message": "Full sync completed",
  "data": {
    "orders_synced": 1250,
    "guests_synced": 890,
    "products_synced": 45
  }
}
```

#### `POST /api/sync/club`
Synchronizes club member data specifically.

**Request:**
```bash
curl -X POST http://localhost:3000/api/sync/club
```

### Insights Endpoints

#### `GET /api/insights`
Retrieves AI-generated insights for the specified date range.

**Request:**
```bash
curl "http://localhost:3000/api/insights?startDate=2024-01-01&endDate=2024-01-31"
```

**Response:**
```json
{
  "insights": [
    {
      "type": "trend",
      "title": "Revenue Growth",
      "description": "Revenue increased by 15% compared to last month",
      "confidence": 0.92
    }
  ]
}
```

### Staff Performance Endpoints

#### `GET /api/staff/performance`
Retrieves staff performance metrics.

**Request:**
```bash
curl "http://localhost:3000/api/staff/performance?startDate=2024-01-01&endDate=2024-01-31"
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database
npm run db:seed      # Seed database with sample data
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (authentication) | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (authentication) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (authentication) | ✅ |
| `COMMERCE7_API_KEY` | Commerce7 API key | ✅ |
| `COMMERCE7_CLIENT_ID` | Commerce7 client ID | ✅ |
| `COMMERCE7_CLIENT_SECRET` | Commerce7 client secret | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | ✅ |
| `RESEND_API_KEY` | Resend email API key | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ✅ |

## 🎯 Key Features Explained

### KPI Tracking
The dashboard tracks four main KPIs:
- **Total Revenue**: Sum of all sales within the selected period
- **Total Guests**: Number of unique visitors
- **Wine Conversion Rate**: Percentage of guests who purchase wine
- **Average Order Value**: Average amount spent per order

### AI Insights
The AI system analyzes:
- Sales trends and patterns
- Staff performance correlations
- Seasonal variations
- Customer behavior patterns
- Revenue optimization opportunities

### Data Synchronization
- **Full Sync**: Imports all historical data from Commerce7
- **Incremental Sync**: Updates only new/changed data
- **Club Sync**: Special handling for wine club members
- **Real-time Updates**: Live data synchronization

## 🔧 Configuration

### MongoDB Setup
1. Set up a MongoDB database (local or cloud)
2. Configure the connection string in your environment variables
3. The app will automatically create collections as needed

### Supabase Setup (Authentication)
1. Create a new Supabase project
2. Configure authentication settings
3. Set up user management and roles
4. Configure Row Level Security (RLS) for user access control

### Commerce7 Integration
1. Obtain API credentials from Commerce7
2. Configure webhook endpoints
3. Set up data mapping rules
4. Test synchronization processes

## 📊 Database Schema

### Key Collections
- `kpi_daily_snapshots`: Daily KPI aggregations
- `orders`: Individual order records
- `guests`: Customer information
- `staff_performance`: Staff metrics
- `products`: Product catalog
- `club_members`: Wine club member data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: russell@mileaestatevineyard.com
- 📱 Phone: (845) 707-3347
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/kpi-dashboard/issues)

---

**Built with ❤️ for Milea Estate Vineyard**

*Last updated: August 2025* 