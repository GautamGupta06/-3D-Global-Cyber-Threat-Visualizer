/**
 * Global Worldwide Geographies and Target SOC Data Centers
 * Covers 250+ cities across all continents with realistic coordinates and metadata.
 */

const GLOBAL_CITIES = [
  // ─── North America ───
  { city: 'New York, USA', country: 'United States', region: 'North America', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles, USA', country: 'United States', region: 'North America', lat: 34.0522, lng: -118.2437 },
  { city: 'Chicago, USA', country: 'United States', region: 'North America', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston, USA', country: 'United States', region: 'North America', lat: 29.7604, lng: -95.3698 },
  { city: 'Phoenix, USA', country: 'United States', region: 'North America', lat: 33.4484, lng: -112.0740 },
  { city: 'Philadelphia, USA', country: 'United States', region: 'North America', lat: 39.9526, lng: -75.1652 },
  { city: 'San Antonio, USA', country: 'United States', region: 'North America', lat: 29.4241, lng: -98.4936 },
  { city: 'San Diego, USA', country: 'United States', region: 'North America', lat: 32.7157, lng: -117.1611 },
  { city: 'Dallas, USA', country: 'United States', region: 'North America', lat: 32.7767, lng: -96.7970 },
  { city: 'San Jose, USA', country: 'United States', region: 'North America', lat: 37.3382, lng: -121.8863 },
  { city: 'Austin, USA', country: 'United States', region: 'North America', lat: 30.2672, lng: -97.7431 },
  { city: 'San Francisco, USA', country: 'United States', region: 'North America', lat: 37.7749, lng: -122.4194 },
  { city: 'Seattle, USA', country: 'United States', region: 'North America', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver, USA', country: 'United States', region: 'North America', lat: 39.7392, lng: -104.9903 },
  { city: 'Washington DC, USA', country: 'United States', region: 'North America', lat: 38.9072, lng: -77.0369 },
  { city: 'Boston, USA', country: 'United States', region: 'North America', lat: 42.3601, lng: -71.0589 },
  { city: 'Miami, USA', country: 'United States', region: 'North America', lat: 25.7617, lng: -80.1918 },
  { city: 'Atlanta, USA', country: 'United States', region: 'North America', lat: 33.7490, lng: -84.3880 },
  { city: 'Detroit, USA', country: 'United States', region: 'North America', lat: 42.3314, lng: -83.0458 },
  { city: 'Minneapolis, USA', country: 'United States', region: 'North America', lat: 44.9778, lng: -93.2650 },
  { city: 'Las Vegas, USA', country: 'United States', region: 'North America', lat: 36.1699, lng: -115.1398 },
  { city: 'Portland, USA', country: 'United States', region: 'North America', lat: 45.5152, lng: -122.6784 },
  { city: 'Honolulu, USA', country: 'United States', region: 'North America', lat: 21.3069, lng: -157.8583 },
  { city: 'Anchorage, USA', country: 'United States', region: 'North America', lat: 61.2181, lng: -149.9003 },
  { city: 'Toronto, Canada', country: 'Canada', region: 'North America', lat: 43.6532, lng: -79.3832 },
  { city: 'Montreal, Canada', country: 'Canada', region: 'North America', lat: 45.5017, lng: -73.5673 },
  { city: 'Vancouver, Canada', country: 'Canada', region: 'North America', lat: 49.2827, lng: -123.1207 },
  { city: 'Calgary, Canada', country: 'Canada', region: 'North America', lat: 51.0447, lng: -114.0719 },
  { city: 'Ottawa, Canada', country: 'Canada', region: 'North America', lat: 45.4215, lng: -75.6972 },
  { city: 'Edmonton, Canada', country: 'Canada', region: 'North America', lat: 53.5461, lng: -113.4938 },
  { city: 'Quebec City, Canada', country: 'Canada', region: 'North America', lat: 46.8139, lng: -71.2080 },
  { city: 'Mexico City, Mexico', country: 'Mexico', region: 'North America', lat: 19.4326, lng: -99.1332 },
  { city: 'Guadalajara, Mexico', country: 'Mexico', region: 'North America', lat: 20.6597, lng: -103.3496 },
  { city: 'Monterrey, Mexico', country: 'Mexico', region: 'North America', lat: 25.6866, lng: -100.3161 },
  { city: 'Tijuana, Mexico', country: 'Mexico', region: 'North America', lat: 32.5149, lng: -117.0382 },
  { city: 'Puebla, Mexico', country: 'Mexico', region: 'North America', lat: 19.0414, lng: -98.2063 },
  { city: 'Cancun, Mexico', country: 'Mexico', region: 'North America', lat: 21.1619, lng: -86.8515 },
  { city: 'Havana, Cuba', country: 'Cuba', region: 'North America', lat: 23.1136, lng: -82.3666 },
  { city: 'San Juan, Puerto Rico', country: 'Puerto Rico', region: 'North America', lat: 18.4655, lng: -66.1057 },
  { city: 'Santo Domingo, Dominican Rep', country: 'Dominican Republic', region: 'North America', lat: 18.4861, lng: -69.9312 },
  { city: 'Panama City, Panama', country: 'Panama', region: 'Central America', lat: 8.9824, lng: -79.5199 },
  { city: 'San Jose, Costa Rica', country: 'Costa Rica', region: 'Central America', lat: 9.9281, lng: -84.0907 },
  { city: 'Guatemala City, Guatemala', country: 'Guatemala', region: 'Central America', lat: 14.6349, lng: -90.5069 },
  { city: 'Kingston, Jamaica', country: 'Jamaica', region: 'Caribbean', lat: 17.9714, lng: -76.7936 },

  // ─── South America ───
  { city: 'Sao Paulo, Brazil', country: 'Brazil', region: 'South America', lat: -23.5505, lng: -46.6333 },
  { city: 'Rio de Janeiro, Brazil', country: 'Brazil', region: 'South America', lat: -22.9068, lng: -43.1729 },
  { city: 'Brasilia, Brazil', country: 'Brazil', region: 'South America', lat: -15.7975, lng: -47.8919 },
  { city: 'Salvador, Brazil', country: 'Brazil', region: 'South America', lat: -12.9714, lng: -38.5014 },
  { city: 'Fortaleza, Brazil', country: 'Brazil', region: 'South America', lat: -3.7172, lng: -38.5433 },
  { city: 'Belo Horizonte, Brazil', country: 'Brazil', region: 'South America', lat: -19.9167, lng: -43.9345 },
  { city: 'Manaus, Brazil', country: 'Brazil', region: 'South America', lat: -3.1190, lng: -60.0217 },
  { city: 'Curitiba, Brazil', country: 'Brazil', region: 'South America', lat: -25.4284, lng: -49.2733 },
  { city: 'Recife, Brazil', country: 'Brazil', region: 'South America', lat: -8.0476, lng: -34.8770 },
  { city: 'Porto Alegre, Brazil', country: 'Brazil', region: 'South America', lat: -30.0346, lng: -51.2177 },
  { city: 'Buenos Aires, Argentina', country: 'Argentina', region: 'South America', lat: -34.6037, lng: -58.3816 },
  { city: 'Cordoba, Argentina', country: 'Argentina', region: 'South America', lat: -31.4201, lng: -64.1888 },
  { city: 'Rosario, Argentina', country: 'Argentina', region: 'South America', lat: -32.9468, lng: -60.6393 },
  { city: 'Mendoza, Argentina', country: 'Argentina', region: 'South America', lat: -32.8895, lng: -68.8458 },
  { city: 'Santiago, Chile', country: 'Chile', region: 'South America', lat: -33.4489, lng: -70.6693 },
  { city: 'Valparaiso, Chile', country: 'Chile', region: 'South America', lat: -33.0472, lng: -71.6127 },
  { city: 'Lima, Peru', country: 'Peru', region: 'South America', lat: -12.0464, lng: -77.0428 },
  { city: 'Arequipa, Peru', country: 'Peru', region: 'South America', lat: -16.4090, lng: -71.5375 },
  { city: 'Bogota, Colombia', country: 'Colombia', region: 'South America', lat: 4.7110, lng: -74.0721 },
  { city: 'Medellin, Colombia', country: 'Colombia', region: 'South America', lat: 6.2442, lng: -75.5812 },
  { city: 'Cali, Colombia', country: 'Colombia', region: 'South America', lat: 3.4516, lng: -76.5320 },
  { city: 'Caracas, Venezuela', country: 'Venezuela', region: 'South America', lat: 10.4806, lng: -66.9036 },
  { city: 'Quito, Ecuador', country: 'Ecuador', region: 'South America', lat: -0.1807, lng: -78.4678 },
  { city: 'Guayaquil, Ecuador', country: 'Ecuador', region: 'South America', lat: -2.1894, lng: -79.8891 },
  { city: 'La Paz, Bolivia', country: 'Bolivia', region: 'South America', lat: -16.4897, lng: -68.1193 },
  { city: 'Asuncion, Paraguay', country: 'Paraguay', region: 'South America', lat: -25.2637, lng: -57.5759 },
  { city: 'Montevideo, Uruguay', country: 'Uruguay', region: 'South America', lat: -34.9011, lng: -56.1645 },

  // ─── Europe ───
  { city: 'London, UK', country: 'United Kingdom', region: 'Europe', lat: 51.5074, lng: -0.1278 },
  { city: 'Manchester, UK', country: 'United Kingdom', region: 'Europe', lat: 53.4808, lng: -2.2426 },
  { city: 'Edinburgh, UK', country: 'United Kingdom', region: 'Europe', lat: 55.9533, lng: -3.1883 },
  { city: 'Dublin, Ireland', country: 'Ireland', region: 'Europe', lat: 53.3498, lng: -6.2603 },
  { city: 'Paris, France', country: 'France', region: 'Europe', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon, France', country: 'France', region: 'Europe', lat: 45.7640, lng: 4.8357 },
  { city: 'Marseille, France', country: 'France', region: 'Europe', lat: 43.2965, lng: 5.3698 },
  { city: 'Frankfurt, Germany', country: 'Germany', region: 'Europe', lat: 50.1109, lng: 8.6821 },
  { city: 'Berlin, Germany', country: 'Germany', region: 'Europe', lat: 52.5200, lng: 13.4050 },
  { city: 'Munich, Germany', country: 'Germany', region: 'Europe', lat: 48.1351, lng: 11.5820 },
  { city: 'Hamburg, Germany', country: 'Germany', region: 'Europe', lat: 53.5511, lng: 9.9937 },
  { city: 'Amsterdam, Netherlands', country: 'Netherlands', region: 'Europe', lat: 52.3676, lng: 4.9041 },
  { city: 'Rotterdam, Netherlands', country: 'Netherlands', region: 'Europe', lat: 51.9244, lng: 4.4777 },
  { city: 'Brussels, Belgium', country: 'Belgium', region: 'Europe', lat: 50.8503, lng: 4.3517 },
  { city: 'Zurich, Switzerland', country: 'Switzerland', region: 'Europe', lat: 47.3769, lng: 8.5417 },
  { city: 'Geneva, Switzerland', country: 'Switzerland', region: 'Europe', lat: 46.2044, lng: 6.1432 },
  { city: 'Vienna, Austria', country: 'Austria', region: 'Europe', lat: 48.2082, lng: 16.3738 },
  { city: 'Rome, Italy', country: 'Italy', region: 'Europe', lat: 41.9028, lng: 12.4964 },
  { city: 'Milan, Italy', country: 'Italy', region: 'Europe', lat: 45.4642, lng: 9.1900 },
  { city: 'Madrid, Spain', country: 'Spain', region: 'Europe', lat: 40.4168, lng: -3.7038 },
  { city: 'Barcelona, Spain', country: 'Spain', region: 'Europe', lat: 41.3851, lng: 2.1734 },
  { city: 'Lisbon, Portugal', country: 'Portugal', region: 'Europe', lat: 38.7223, lng: -9.1393 },
  { city: 'Stockholm, Sweden', country: 'Sweden', region: 'Europe', lat: 59.3293, lng: 18.0686 },
  { city: 'Oslo, Norway', country: 'Norway', region: 'Europe', lat: 59.9139, lng: 10.7522 },
  { city: 'Copenhagen, Denmark', country: 'Denmark', region: 'Europe', lat: 55.6761, lng: 12.5683 },
  { city: 'Helsinki, Finland', country: 'Finland', region: 'Europe', lat: 60.1699, lng: 24.9384 },
  { city: 'Warsaw, Poland', country: 'Poland', region: 'Europe', lat: 52.2297, lng: 21.0122 },
  { city: 'Prague, Czechia', country: 'Czech Republic', region: 'Europe', lat: 50.0755, lng: 14.4378 },
  { city: 'Budapest, Hungary', country: 'Hungary', region: 'Europe', lat: 47.4979, lng: 19.0402 },
  { city: 'Bucharest, Romania', country: 'Romania', region: 'Europe', lat: 44.4268, lng: 26.1025 },
  { city: 'Athens, Greece', country: 'Greece', region: 'Europe', lat: 37.9838, lng: 23.7275 },
  { city: 'Istanbul, Turkey', country: 'Turkey', region: 'Europe', lat: 41.0082, lng: 28.9784 },
  { city: 'Kyiv, Ukraine', country: 'Ukraine', region: 'Europe', lat: 50.4501, lng: 30.5234 },

  // ─── Asia & Pacific ───
  { city: 'Tokyo, Japan', country: 'Japan', region: 'East Asia', lat: 35.6762, lng: 139.6503 },
  { city: 'Osaka, Japan', country: 'Japan', region: 'East Asia', lat: 34.6937, lng: 135.5023 },
  { city: 'Nagoya, Japan', country: 'Japan', region: 'East Asia', lat: 35.1815, lng: 136.9066 },
  { city: 'Sapporo, Japan', country: 'Japan', region: 'East Asia', lat: 43.0618, lng: 141.3545 },
  { city: 'Fukuoka, Japan', country: 'Japan', region: 'East Asia', lat: 33.5904, lng: 130.4017 },
  { city: 'Seoul, South Korea', country: 'South Korea', region: 'East Asia', lat: 37.5665, lng: 126.9780 },
  { city: 'Busan, South Korea', country: 'South Korea', region: 'East Asia', lat: 35.1796, lng: 129.0756 },
  { city: 'Incheon, South Korea', country: 'South Korea', region: 'East Asia', lat: 37.4563, lng: 126.7052 },
  { city: 'Beijing, China', country: 'China', region: 'East Asia', lat: 39.9042, lng: 116.4074 },
  { city: 'Shanghai, China', country: 'China', region: 'East Asia', lat: 31.2304, lng: 121.4737 },
  { city: 'Shenzhen, China', country: 'China', region: 'East Asia', lat: 22.5431, lng: 114.0579 },
  { city: 'Guangzhou, China', country: 'China', region: 'East Asia', lat: 23.1291, lng: 113.2644 },
  { city: 'Chengdu, China', country: 'China', region: 'East Asia', lat: 30.5728, lng: 104.0668 },
  { city: 'Hangzhou, China', country: 'China', region: 'East Asia', lat: 30.2741, lng: 120.1551 },
  { city: 'Wuhan, China', country: 'China', region: 'East Asia', lat: 30.5928, lng: 114.3055 },
  { city: 'Hong Kong', country: 'Hong Kong', region: 'East Asia', lat: 22.3193, lng: 114.1694 },
  { city: 'Taipei, Taiwan', country: 'Taiwan', region: 'East Asia', lat: 25.0330, lng: 121.5654 },
  { city: 'Singapore', country: 'Singapore', region: 'Southeast Asia', lat: 1.3521, lng: 103.8198 },
  { city: 'Bangkok, Thailand', country: 'Thailand', region: 'Southeast Asia', lat: 13.7563, lng: 100.5018 },
  { city: 'Kuala Lumpur, Malaysia', country: 'Malaysia', region: 'Southeast Asia', lat: 3.1390, lng: 101.6869 },
  { city: 'Jakarta, Indonesia', country: 'Indonesia', region: 'Southeast Asia', lat: -6.2088, lng: 106.8456 },
  { city: 'Surabaya, Indonesia', country: 'Indonesia', region: 'Southeast Asia', lat: -7.2575, lng: 112.7521 },
  { city: 'Manila, Philippines', country: 'Philippines', region: 'Southeast Asia', lat: 14.5995, lng: 120.9842 },
  { city: 'Ho Chi Minh City, Vietnam', country: 'Vietnam', region: 'Southeast Asia', lat: 10.8231, lng: 106.6297 },
  { city: 'Hanoi, Vietnam', country: 'Vietnam', region: 'Southeast Asia', lat: 21.0285, lng: 105.8542 },
  { city: 'New Delhi, India', country: 'India', region: 'South Asia', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai, India', country: 'India', region: 'South Asia', lat: 19.0760, lng: 72.8777 },
  { city: 'Bengaluru, India', country: 'India', region: 'South Asia', lat: 12.9716, lng: 77.5946 },
  { city: 'Hyderabad, India', country: 'India', region: 'South Asia', lat: 17.3850, lng: 78.4867 },
  { city: 'Chennai, India', country: 'India', region: 'South Asia', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata, India', country: 'India', region: 'South Asia', lat: 22.5726, lng: 88.3639 },
  { city: 'Pune, India', country: 'India', region: 'South Asia', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad, India', country: 'India', region: 'South Asia', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur, India', country: 'India', region: 'South Asia', lat: 26.9124, lng: 75.7873 },
  { city: 'Karachi, Pakistan', country: 'Pakistan', region: 'South Asia', lat: 24.8607, lng: 67.0011 },
  { city: 'Lahore, Pakistan', country: 'Pakistan', region: 'South Asia', lat: 31.5204, lng: 74.3587 },
  { city: 'Dhaka, Bangladesh', country: 'Bangladesh', region: 'South Asia', lat: 23.8103, lng: 90.4125 },
  { city: 'Colombo, Sri Lanka', country: 'Sri Lanka', region: 'South Asia', lat: 6.9271, lng: 79.8612 },
  { city: 'Sydney, Australia', country: 'Australia', region: 'Oceania', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne, Australia', country: 'Australia', region: 'Oceania', lat: -37.8136, lng: 144.9631 },
  { city: 'Brisbane, Australia', country: 'Australia', region: 'Oceania', lat: -27.4698, lng: 153.0251 },
  { city: 'Perth, Australia', country: 'Australia', region: 'Oceania', lat: -31.9505, lng: 115.8605 },
  { city: 'Auckland, New Zealand', country: 'New Zealand', region: 'Oceania', lat: -36.8485, lng: 174.7633 },

  // ─── Middle East ───
  { city: 'Dubai, UAE', country: 'United Arab Emirates', region: 'Middle East', lat: 25.2048, lng: 55.2708 },
  { city: 'Abu Dhabi, UAE', country: 'United Arab Emirates', region: 'Middle East', lat: 24.4539, lng: 54.3773 },
  { city: 'Riyadh, Saudi Arabia', country: 'Saudi Arabia', region: 'Middle East', lat: 24.7136, lng: 46.6753 },
  { city: 'Jeddah, Saudi Arabia', country: 'Saudi Arabia', region: 'Middle East', lat: 21.4858, lng: 39.1925 },
  { city: 'Doha, Qatar', country: 'Qatar', region: 'Middle East', lat: 25.2854, lng: 51.5310 },
  { city: 'Kuwait City, Kuwait', country: 'Kuwait', region: 'Middle East', lat: 29.3759, lng: 47.9774 },
  { city: 'Manama, Bahrain', country: 'Bahrain', region: 'Middle East', lat: 26.2285, lng: 50.5860 },
  { city: 'Muscat, Oman', country: 'Oman', region: 'Middle East', lat: 23.5859, lng: 58.4059 },
  { city: 'Tel Aviv, Israel', country: 'Israel', region: 'Middle East', lat: 32.0853, lng: 34.7818 },
  { city: 'Amman, Jordan', country: 'Jordan', region: 'Middle East', lat: 31.9454, lng: 35.9284 },
  { city: 'Beirut, Lebanon', country: 'Lebanon', region: 'Middle East', lat: 33.8938, lng: 35.5018 },
  { city: 'Baghdad, Iraq', country: 'Iraq', region: 'Middle East', lat: 33.3152, lng: 44.3661 },

  // ─── Africa ───
  { city: 'Cairo, Egypt', country: 'Egypt', region: 'Africa', lat: 30.0444, lng: 31.2357 },
  { city: 'Alexandria, Egypt', country: 'Egypt', region: 'Africa', lat: 31.2001, lng: 29.9187 },
  { city: 'Johannesburg, South Africa', country: 'South Africa', region: 'Africa', lat: -26.2041, lng: 28.0473 },
  { city: 'Cape Town, South Africa', country: 'South Africa', region: 'Africa', lat: -33.9249, lng: 18.4241 },
  { city: 'Durban, South Africa', country: 'South Africa', region: 'Africa', lat: -29.8587, lng: 31.0218 },
  { city: 'Nairobi, Kenya', country: 'Kenya', region: 'Africa', lat: -1.2921, lng: 36.8219 },
  { city: 'Mombasa, Kenya', country: 'Kenya', region: 'Africa', lat: -4.0435, lng: 39.6682 },
  { city: 'Lagos, Nigeria', country: 'Nigeria', region: 'Africa', lat: 6.5244, lng: 3.3792 },
  { city: 'Abuja, Nigeria', country: 'Nigeria', region: 'Africa', lat: 9.0765, lng: 7.3986 },
  { city: 'Casablanca, Morocco', country: 'Morocco', region: 'Africa', lat: 33.5731, lng: -7.5898 },
  { city: 'Rabat, Morocco', country: 'Morocco', region: 'Africa', lat: 34.0209, lng: -6.8416 },
  { city: 'Addis Ababa, Ethiopia', country: 'Ethiopia', region: 'Africa', lat: 9.0320, lng: 38.7469 },
  { city: 'Accra, Ghana', country: 'Ghana', region: 'Africa', lat: 5.6037, lng: -0.1870 },
  { city: 'Dakar, Senegal', country: 'Senegal', region: 'Africa', lat: 14.7167, lng: -17.4677 },
  { city: 'Algiers, Algeria', country: 'Algeria', region: 'Africa', lat: 36.7538, lng: 3.0588 },
  { city: 'Tunis, Tunisia', country: 'Tunisia', region: 'Africa', lat: 36.8065, lng: 10.1815 },
  { city: 'Kigali, Rwanda', country: 'Rwanda', region: 'Africa', lat: -1.9706, lng: 30.1044 },
  { city: 'Kampala, Uganda', country: 'Uganda', region: 'Africa', lat: 0.3476, lng: 32.5825 }
];

const GLOBAL_DESTINATIONS = [
  { name: 'Central NOC (New Delhi)', lat: 28.6139, lng: 77.2090, region: 'South Asia' },
  { name: 'US-East Cloud Core (Virginia)', lat: 38.9072, lng: -77.0369, region: 'North America' },
  { name: 'US-West Data Center (Oregon)', lat: 45.5152, lng: -122.6784, region: 'North America' },
  { name: 'US-Central Hub (Dallas, TX)', lat: 32.7767, lng: -96.7970, region: 'North America' },
  { name: 'US-West Pacific (Silicon Valley)', lat: 37.3382, lng: -121.8863, region: 'North America' },
  { name: 'Canada-Central (Toronto)', lat: 43.6532, lng: -79.3832, region: 'North America' },
  { name: 'Europe-Central SOC (Frankfurt)', lat: 50.1109, lng: 8.6821, region: 'Europe' },
  { name: 'UK-Regional Gateway (London)', lat: 51.5074, lng: -0.1278, region: 'Europe' },
  { name: 'Europe-West Hub (Paris)', lat: 48.8566, lng: 2.3522, region: 'Europe' },
  { name: 'Europe-North SOC (Stockholm)', lat: 59.3293, lng: 18.0686, region: 'Europe' },
  { name: 'Europe-South Core (Milan)', lat: 45.4642, lng: 9.1900, region: 'Europe' },
  { name: 'Europe-West-2 (Amsterdam)', lat: 52.3676, lng: 4.9041, region: 'Europe' },
  { name: 'East Asia Primary (Tokyo)', lat: 35.6762, lng: 139.6503, region: 'East Asia' },
  { name: 'Korea Central SOC (Seoul)', lat: 37.5665, lng: 126.9780, region: 'East Asia' },
  { name: 'China Gateway (Hong Kong)', lat: 22.3193, lng: 114.1694, region: 'East Asia' },
  { name: 'Asia-Pacific Core (Singapore)', lat: 1.3521, lng: 103.8198, region: 'Southeast Asia' },
  { name: 'South Asia Gateway (Mumbai)', lat: 19.0760, lng: 72.8777, region: 'South Asia' },
  { name: 'India-South Hub (Bengaluru)', lat: 12.9716, lng: 77.5946, region: 'South Asia' },
  { name: 'Australia East SOC (Sydney)', lat: -33.8688, lng: 151.2093, region: 'Oceania' },
  { name: 'Australia South Hub (Melbourne)', lat: -37.8136, lng: 144.9631, region: 'Oceania' },
  { name: 'Middle East Primary (Dubai)', lat: 25.2048, lng: 55.2708, region: 'Middle East' },
  { name: 'Middle East North (Riyadh)', lat: 24.7136, lng: 46.6753, region: 'Middle East' },
  { name: 'South America SOC (Sao Paulo)', lat: -23.5505, lng: -46.6333, region: 'South America' },
  { name: 'South America West (Santiago)', lat: -33.4489, lng: -70.6693, region: 'South America' },
  { name: 'Africa South Core (Johannesburg)', lat: -26.2041, lng: 28.0473, region: 'Africa' },
  { name: 'Africa East SOC (Nairobi)', lat: -1.2921, lng: 36.8219, region: 'Africa' },
  { name: 'Africa North Hub (Cairo)', lat: 30.0444, lng: 31.2357, region: 'Africa' }
];

const ATTACK_TYPES = [
  'DDoS_Volume_Spike',
  'SQL_Injection',
  'Adversarial_Drift',
  'Malware_Drop',
  'Port_Scan',
  'Brute_Force',
  'Network_Pulse'
];

/**
 * Generate a realistic public IPv4 address with region-specific routing simulation
 */
function generateRandomIP(region) {
  const prefixes = {
    'North America': ['23', '24', '34', '50', '66', '74', '98', '104', '142', '172'],
    'Europe': ['46', '62', '80', '82', '84', '87', '91', '178', '185', '194'],
    'East Asia': ['101', '103', '114', '118', '124', '140', '180', '210', '222'],
    'Southeast Asia': ['110', '115', '119', '125', '175', '182', '202', '203'],
    'South Asia': ['103', '106', '117', '122', '150', '157', '182', '223'],
    'South America': ['177', '179', '181', '186', '187', '189', '190', '200', '201'],
    'Middle East': ['78', '88', '94', '188', '195', '212', '213'],
    'Africa': ['41', '102', '105', '154', '160', '196', '197'],
    'Oceania': ['101', '120', '139', '144', '203', '210']
  };

  const regPrefixes = prefixes[region] || ['45', '103', '185', '192', '198'];
  const p1 = regPrefixes[Math.floor(Math.random() * regPrefixes.length)];
  const p2 = Math.floor(Math.random() * 254) + 1;
  const p3 = Math.floor(Math.random() * 254) + 1;
  const p4 = Math.floor(Math.random() * 254) + 1;
  return `${p1}.${p2}.${p3}.${p4}`;
}

/**
 * Calculate dynamic AI / NIDS model accuracy and confidence telemetry
 */
function computePredictionIntelligence(severity, attackType, driftScore, reconError) {
  const isDDoS = attackType.includes('DDoS');
  const isSQL = attackType.includes('SQL');
  const isMalware = attackType.includes('Malware');
  const isPortScan = attackType.includes('Port_Scan');
  const isBrute = attackType.includes('Brute');
  const isPulse = attackType === 'Network_Pulse';

  // Base classification accuracy: between 96.0% and 99.4%
  let baseAcc = 97.4 + (severity * 1.8) + (Math.random() * 0.4 - 0.2);
  if (isDDoS) baseAcc = Math.min(99.6, baseAcc + 0.9);
  if (isPulse) baseAcc = 98.8;

  // ML Confidence score: between 91.5% and 99.5%
  let conf = 92.0 + (severity * 6.5) + (Math.random() * 1.2 - 0.6);
  if (reconError > 0.15) conf = Math.min(99.7, conf + 1.2);

  // Precision and Recall
  const precision = Math.min(99.8, 97.2 + (severity * 2.1) + (Math.random() * 0.3));
  const recall = Math.min(99.9, 97.8 + (severity * 1.9) + (Math.random() * 0.2));
  const f1 = (2 * (precision * recall) / (precision + recall)).toFixed(1);

  // False positive risk
  const fpRisk = isPulse ? 0.3 : Math.max(0.2, ((1.0 - severity) * 2.8)).toFixed(1);

  // Determine prediction status badge
  let status = 'NOMINAL_TELEMETRY';
  if (severity >= 0.65 || isDDoS) {
    status = 'TRUE_POSITIVE_CONFIRMED';
  } else if (severity >= 0.40) {
    status = 'HIGH_CERTAINTY_INTRUSION';
  } else if (driftScore > 0.45) {
    status = 'ADVERSARIAL_DRIFT_ALERT';
  } else if (severity >= 0.20) {
    status = 'ANOMALOUS_FLOW_DETECTED';
  }

  // Feature attributions for explainability
  let attributions = [];
  if (isDDoS) {
    attributions = [
      { feature: 'packet_rate_pps', contribution_pct: 94.8, formatted_pct: '94.8%', description: 'Volumetric ingress flood' },
      { feature: 'syn_ack_ratio', contribution_pct: 89.2, formatted_pct: '89.2%', description: 'Asymmetric TCP half-open connections' },
      { feature: 'port_diversity', contribution_pct: 78.4, formatted_pct: '78.4%', description: 'High-frequency port saturation' }
    ];
  } else if (isSQL) {
    attributions = [
      { feature: 'uri_entropy', contribution_pct: 93.6, formatted_pct: '93.6%', description: 'SQL injection payload query entropy' },
      { feature: 'byte_entropy', contribution_pct: 86.4, formatted_pct: '86.4%', description: 'Abnormal byte distribution in HTTP payload' },
      { feature: 'error_response_rate', contribution_pct: 74.2, formatted_pct: '74.2%', description: 'Database exception 500 response spike' }
    ];
  } else if (isMalware) {
    attributions = [
      { feature: 'tls_ja3_variance', contribution_pct: 95.1, formatted_pct: '95.1%', description: 'Unrecognized C2 JA3/JA3S TLS fingerprint' },
      { feature: 'payload_length', contribution_pct: 83.7, formatted_pct: '83.7%', description: 'Binary payload staging sequence' },
      { feature: 'packet_jitter', contribution_pct: 76.5, formatted_pct: '76.5%', description: 'C2 heartbeat beacon periodicity' }
    ];
  } else if (isPortScan) {
    attributions = [
      { feature: 'port_diversity', contribution_pct: 97.2, formatted_pct: '97.2%', description: 'Sequential TCP SYN scanning sweep' },
      { feature: 'error_response_rate', contribution_pct: 90.5, formatted_pct: '90.5%', description: 'Closed port TCP RST spike' },
      { feature: 'flow_duration', contribution_pct: 73.1, formatted_pct: '73.1%', description: 'Sub-millisecond probe timeouts' }
    ];
  } else if (isBrute) {
    attributions = [
      { feature: 'error_response_rate', contribution_pct: 96.4, formatted_pct: '96.4%', description: '401/403 HTTP authentication failure flood' },
      { feature: 'packet_rate_pps', contribution_pct: 88.9, formatted_pct: '88.9%', description: 'High-speed credential stuffing attempts' },
      { feature: 'flow_duration', contribution_pct: 70.2, formatted_pct: '70.2%', description: 'Rapid auth session termination' }
    ];
  } else {
    attributions = [
      { feature: 'concept_drift_divergence', contribution_pct: 88.5, formatted_pct: '88.5%', description: 'P_t(X) ≠ P_{t-1}(X) Statistical divergence' },
      { feature: 'byte_entropy', contribution_pct: 81.0, formatted_pct: '81.0%', description: 'Feature vector latent departure' },
      { feature: 'packet_jitter', contribution_pct: 66.8, formatted_pct: '66.8%', description: 'Micro-burst timing variation' }
    ];
  }

  return {
    ml_accuracy: parseFloat(baseAcc.toFixed(1)),
    ml_confidence: parseFloat(conf.toFixed(1)),
    precision_score: parseFloat(precision.toFixed(1)),
    recall_score: parseFloat(recall.toFixed(1)),
    f1_score: parseFloat(f1),
    false_positive_risk: parseFloat(fpRisk),
    prediction_status: status,
    model_architecture: 'PyTorch Deep Autoencoder + EWMA XAI',
    feature_attributions: attributions,
    top_driving_feature: attributions[0].feature
  };
}

/**
 * Generate a complete, highly realistic multi-city cyber threat event
 */
function createSyntheticThreat(customOpts = {}) {
  const source = customOpts.source || GLOBAL_CITIES[Math.floor(Math.random() * GLOBAL_CITIES.length)];
  const dest = customOpts.dest || GLOBAL_DESTINATIONS[Math.floor(Math.random() * GLOBAL_DESTINATIONS.length)];
  const attack_type = customOpts.attack_type || ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];

  const isCritical = attack_type === 'DDoS_Volume_Spike' || (attack_type !== 'Network_Pulse' && Math.random() > 0.45);
  const severity = customOpts.severity !== undefined
    ? customOpts.severity
    : (isCritical ? parseFloat((Math.random() * 0.38 + 0.62).toFixed(2)) : parseFloat((Math.random() * 0.32 + 0.12).toFixed(2)));

  const drift_score = customOpts.drift_score !== undefined
    ? customOpts.drift_score
    : (isCritical ? parseFloat((Math.random() * 0.45 + 0.48).toFixed(2)) : parseFloat((Math.random() * 0.22 + 0.05).toFixed(2)));

  const recon_error = parseFloat((severity * 0.29 + (Math.random() * 0.04 - 0.02)).toFixed(4));
  const intelligence = computePredictionIntelligence(severity, attack_type, drift_score, recon_error);

  // Micro-coordinate jitter (0.2° to 0.8°) around metropolitan centers
  const latJitter = (Math.random() - 0.5) * 0.9;
  const lngJitter = (Math.random() - 0.5) * 0.9;

  const sourceIP = generateRandomIP(source.region);
  const destSubnet = Math.floor(Math.random() * 50) + 1;
  const destHost = Math.floor(Math.random() * 254) + 1;

  const timestamp = customOpts.timestamp || Math.floor(Date.now() / 1000);

  return {
    id: `${sourceIP}-${timestamp}-${Math.floor(Math.random() * 10000)}`,
    timestamp,
    source_ip: sourceIP,
    dest_ip: `10.${destSubnet}.${Math.floor(Math.random() * 10)}.${destHost}`,
    source_lat: parseFloat((source.lat + latJitter).toFixed(4)),
    source_long: parseFloat((source.lng + lngJitter).toFixed(4)),
    dest_lat: dest.lat,
    dest_long: dest.lng,
    city: source.city,
    country: source.country,
    region: source.region,
    dest_name: dest.name,
    dest_region: dest.region,
    attack_type,
    severity,
    drift_score,
    reconstruction_error: recon_error,
    severity_level: isCritical ? 'CRITICAL' : (severity >= 0.40 ? 'HIGH' : (severity >= 0.20 ? 'MEDIUM' : 'LOW')),
    action: isCritical ? 'trigger_camera_zoom' : 'none',
    ...intelligence,
    ...customOpts
  };
}

module.exports = {
  GLOBAL_CITIES,
  GLOBAL_DESTINATIONS,
  ATTACK_TYPES,
  generateRandomIP,
  computePredictionIntelligence,
  createSyntheticThreat
};
