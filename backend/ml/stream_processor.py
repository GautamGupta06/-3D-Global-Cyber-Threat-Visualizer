import time
import json
import random
import sys
import os
import requests
import numpy as np

# Add parent and local path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from nids_autoencoder import ConceptDriftDetector

BACKEND_API = "http://localhost:4000/api/threats"

# Comprehensive Worldwide Target Geographies (220+ global hubs across all continents)
GLOBAL_TARGETS = [
    # ─── North America (USA, Canada, Mexico, Caribbean, Central America) ───
    {"city": "New York, USA", "lat": 40.7128, "lng": -74.0060},
    {"city": "Los Angeles, USA", "lat": 34.0522, "lng": -118.2437},
    {"city": "Chicago, USA", "lat": 41.8781, "lng": -87.6298},
    {"city": "Houston, USA", "lat": 29.7604, "lng": -95.3698},
    {"city": "Phoenix, USA", "lat": 33.4484, "lng": -112.0740},
    {"city": "Philadelphia, USA", "lat": 39.9526, "lng": -75.1652},
    {"city": "San Antonio, USA", "lat": 29.4241, "lng": -98.4936},
    {"city": "San Diego, USA", "lat": 32.7157, "lng": -117.1611},
    {"city": "Dallas, USA", "lat": 32.7767, "lng": -96.7970},
    {"city": "San Jose, USA", "lat": 37.3382, "lng": -121.8863},
    {"city": "Austin, USA", "lat": 30.2672, "lng": -97.7431},
    {"city": "San Francisco, USA", "lat": 37.7749, "lng": -122.4194},
    {"city": "Seattle, USA", "lat": 47.6062, "lng": -122.3321},
    {"city": "Denver, USA", "lat": 39.7392, "lng": -104.9903},
    {"city": "Washington DC, USA", "lat": 38.9072, "lng": -77.0369},
    {"city": "Boston, USA", "lat": 42.3601, "lng": -71.0589},
    {"city": "Miami, USA", "lat": 25.7617, "lng": -80.1918},
    {"city": "Atlanta, USA", "lat": 33.7490, "lng": -84.3880},
    {"city": "Detroit, USA", "lat": 42.3314, "lng": -83.0458},
    {"city": "Minneapolis, USA", "lat": 44.9778, "lng": -93.2650},
    {"city": "Las Vegas, USA", "lat": 36.1699, "lng": -115.1398},
    {"city": "Portland, USA", "lat": 45.5152, "lng": -122.6784},
    {"city": "Honolulu, USA", "lat": 21.3069, "lng": -157.8583},
    {"city": "Anchorage, USA", "lat": 61.2181, "lng": -149.9003},
    {"city": "Toronto, Canada", "lat": 43.6532, "lng": -79.3832},
    {"city": "Montreal, Canada", "lat": 45.5017, "lng": -73.5673},
    {"city": "Vancouver, Canada", "lat": 49.2827, "lng": -123.1207},
    {"city": "Calgary, Canada", "lat": 51.0447, "lng": -114.0719},
    {"city": "Ottawa, Canada", "lat": 45.4215, "lng": -75.6972},
    {"city": "Edmonton, Canada", "lat": 53.5461, "lng": -113.4938},
    {"city": "Quebec City, Canada", "lat": 46.8139, "lng": -71.2080},
    {"city": "Mexico City, Mexico", "lat": 19.4326, "lng": -99.1332},
    {"city": "Guadalajara, Mexico", "lat": 20.6597, "lng": -103.3496},
    {"city": "Monterrey, Mexico", "lat": 25.6866, "lng": -100.3161},
    {"city": "Tijuana, Mexico", "lat": 32.5149, "lng": -117.0382},
    {"city": "Puebla, Mexico", "lat": 19.0414, "lng": -98.2063},
    {"city": "Cancun, Mexico", "lat": 21.1619, "lng": -86.8515},
    {"city": "Havana, Cuba", "lat": 23.1136, "lng": -82.3666},
    {"city": "San Juan, Puerto Rico", "lat": 18.4655, "lng": -66.1057},
    {"city": "Santo Domingo, Dominican Rep", "lat": 18.4861, "lng": -69.9312},
    {"city": "Panama City, Panama", "lat": 8.9824, "lng": -79.5199},
    {"city": "San Jose, Costa Rica", "lat": 9.9281, "lng": -84.0907},
    {"city": "Guatemala City, Guatemala", "lat": 14.6349, "lng": -90.5069},
    {"city": "Kingston, Jamaica", "lat": 17.9714, "lng": -76.7936},

    # ─── South America ───
    {"city": "Sao Paulo, Brazil", "lat": -23.5505, "lng": -46.6333},
    {"city": "Rio de Janeiro, Brazil", "lat": -22.9068, "lng": -43.1729},
    {"city": "Brasilia, Brazil", "lat": -15.7975, "lng": -47.8919},
    {"city": "Salvador, Brazil", "lat": -12.9714, "lng": -38.5014},
    {"city": "Fortaleza, Brazil", "lat": -3.7172, "lng": -38.5433},
    {"city": "Belo Horizonte, Brazil", "lat": -19.9167, "lng": -43.9345},
    {"city": "Manaus, Brazil", "lat": -3.1190, "lng": -60.0217},
    {"city": "Curitiba, Brazil", "lat": -25.4284, "lng": -49.2733},
    {"city": "Recife, Brazil", "lat": -8.0476, "lng": -34.8770},
    {"city": "Porto Alegre, Brazil", "lat": -30.0346, "lng": -51.2177},
    {"city": "Buenos Aires, Argentina", "lat": -34.6037, "lng": -58.3816},
    {"city": "Cordoba, Argentina", "lat": -31.4201, "lng": -64.1888},
    {"city": "Rosario, Argentina", "lat": -32.9468, "lng": -60.6393},
    {"city": "Mendoza, Argentina", "lat": -32.8895, "lng": -68.8458},
    {"city": "Santiago, Chile", "lat": -33.4489, "lng": -70.6693},
    {"city": "Valparaiso, Chile", "lat": -33.0472, "lng": -71.6127},
    {"city": "Concepcion, Chile", "lat": -36.8270, "lng": -73.0503},
    {"city": "Lima, Peru", "lat": -12.0464, "lng": -77.0428},
    {"city": "Arequipa, Peru", "lat": -16.4090, "lng": -71.5375},
    {"city": "Cusco, Peru", "lat": -13.5319, "lng": -71.9675},
    {"city": "Bogota, Colombia", "lat": 4.7110, "lng": -74.0721},
    {"city": "Medellin, Colombia", "lat": 6.2442, "lng": -75.5812},
    {"city": "Cali, Colombia", "lat": 3.4516, "lng": -76.5320},
    {"city": "Barranquilla, Colombia", "lat": 10.9685, "lng": -74.7813},
    {"city": "Caracas, Venezuela", "lat": 10.4806, "lng": -66.9036},
    {"city": "Maracaibo, Venezuela", "lat": 10.6427, "lng": -71.6125},
    {"city": "Quito, Ecuador", "lat": -0.1807, "lng": -78.4678},
    {"city": "Guayaquil, Ecuador", "lat": -2.1894, "lng": -79.8891},
    {"city": "La Paz, Bolivia", "lat": -16.4897, "lng": -68.1193},
    {"city": "Santa Cruz, Bolivia", "lat": -17.7833, "lng": -63.1821},
    {"city": "Asuncion, Paraguay", "lat": -25.2637, "lng": -57.5759},
    {"city": "Montevideo, Uruguay", "lat": -34.9011, "lng": -56.1645},
    {"city": "Georgetown, Guyana", "lat": 6.8013, "lng": -58.1551},
    {"city": "Paramaribo, Suriname", "lat": 5.8520, "lng": -55.2038},

    # ─── Europe ───
    {"city": "London, UK", "lat": 51.5074, "lng": -0.1278},
    {"city": "Manchester, UK", "lat": 53.4808, "lng": -2.2426},
    {"city": "Birmingham, UK", "lat": 52.4862, "lng": -1.8904},
    {"city": "Edinburgh, UK", "lat": 55.9533, "lng": -3.1883},
    {"city": "Glasgow, UK", "lat": 55.8642, "lng": -4.2518},
    {"city": "Dublin, Ireland", "lat": 53.3498, "lng": -6.2603},
    {"city": "Belfast, UK", "lat": 54.5973, "lng": -5.9301},
    {"city": "Paris, France", "lat": 48.8566, "lng": 2.3522},
    {"city": "Marseille, France", "lat": 43.2965, "lng": 5.3698},
    {"city": "Lyon, France", "lat": 45.7640, "lng": 4.8357},
    {"city": "Toulouse, France", "lat": 43.6047, "lng": 1.4442},
    {"city": "Nice, France", "lat": 43.7102, "lng": 7.2620},
    {"city": "Frankfurt, Germany", "lat": 50.1109, "lng": 8.6821},
    {"city": "Berlin, Germany", "lat": 52.5200, "lng": 13.4050},
    {"city": "Munich, Germany", "lat": 48.1351, "lng": 11.5820},
    {"city": "Hamburg, Germany", "lat": 53.5511, "lng": 9.9937},
    {"city": "Cologne, Germany", "lat": 50.9375, "lng": 6.9603},
    {"city": "Stuttgart, Germany", "lat": 48.7758, "lng": 9.1829},
    {"city": "Dusseldorf, Germany", "lat": 51.2277, "lng": 6.7735},
    {"city": "Amsterdam, Netherlands", "lat": 52.3676, "lng": 4.9041},
    {"city": "Rotterdam, Netherlands", "lat": 51.9244, "lng": 4.4777},
    {"city": "The Hague, Netherlands", "lat": 52.0705, "lng": 4.3007},
    {"city": "Brussels, Belgium", "lat": 50.8503, "lng": 4.3517},
    {"city": "Antwerp, Belgium", "lat": 51.2194, "lng": 4.4025},
    {"city": "Luxembourg City, Luxembourg", "lat": 49.6116, "lng": 6.1319},
    {"city": "Madrid, Spain", "lat": 40.4168, "lng": -3.7038},
    {"city": "Barcelona, Spain", "lat": 41.3851, "lng": 2.1734},
    {"city": "Valencia, Spain", "lat": 39.4699, "lng": -0.3763},
    {"city": "Seville, Spain", "lat": 37.3891, "lng": -5.9845},
    {"city": "Bilbao, Spain", "lat": 43.2630, "lng": -2.9350},
    {"city": "Lisbon, Portugal", "lat": 38.7223, "lng": -9.1393},
    {"city": "Porto, Portugal", "lat": 41.1579, "lng": -8.6291},
    {"city": "Rome, Italy", "lat": 41.9028, "lng": 12.4964},
    {"city": "Milan, Italy", "lat": 45.4642, "lng": 9.1900},
    {"city": "Naples, Italy", "lat": 40.8518, "lng": 14.2681},
    {"city": "Turin, Italy", "lat": 45.0703, "lng": 7.6869},
    {"city": "Florence, Italy", "lat": 43.7696, "lng": 11.2558},
    {"city": "Venice, Italy", "lat": 45.4408, "lng": 12.3155},
    {"city": "Zurich, Switzerland", "lat": 47.3769, "lng": 8.5417},
    {"city": "Geneva, Switzerland", "lat": 46.2044, "lng": 6.1432},
    {"city": "Basel, Switzerland", "lat": 47.5596, "lng": 7.5886},
    {"city": "Vienna, Austria", "lat": 48.2082, "lng": 16.3738},
    {"city": "Salzburg, Austria", "lat": 47.8095, "lng": 13.0550},
    {"city": "Warsaw, Poland", "lat": 52.2297, "lng": 21.0122},
    {"city": "Krakow, Poland", "lat": 50.0647, "lng": 19.9450},
    {"city": "Gdansk, Poland", "lat": 54.3520, "lng": 18.6466},
    {"city": "Prague, Czech Republic", "lat": 50.0755, "lng": 14.4378},
    {"city": "Brno, Czech Republic", "lat": 49.1951, "lng": 16.6068},
    {"city": "Budapest, Hungary", "lat": 47.4979, "lng": 19.0402},
    {"city": "Bucharest, Romania", "lat": 44.4268, "lng": 26.1025},
    {"city": "Sofia, Bulgaria", "lat": 42.6977, "lng": 23.3219},
    {"city": "Athens, Greece", "lat": 37.9838, "lng": 23.7275},
    {"city": "Thessaloniki, Greece", "lat": 40.6401, "lng": 22.9444},
    {"city": "Istanbul, Turkey", "lat": 41.0082, "lng": 28.9784},
    {"city": "Ankara, Turkey", "lat": 39.9334, "lng": 32.8597},
    {"city": "Izmir, Turkey", "lat": 38.4237, "lng": 27.1428},
    {"city": "Kyiv, Ukraine", "lat": 50.4501, "lng": 30.5234},
    {"city": "Lviv, Ukraine", "lat": 49.8397, "lng": 24.0297},
    {"city": "Odesa, Ukraine", "lat": 46.4825, "lng": 30.7233},
    {"city": "Stockholm, Sweden", "lat": 59.3293, "lng": 18.0686},
    {"city": "Gothenburg, Sweden", "lat": 57.7089, "lng": 11.9746},
    {"city": "Oslo, Norway", "lat": 59.9139, "lng": 10.7522},
    {"city": "Bergen, Norway", "lat": 60.3913, "lng": 5.3221},
    {"city": "Copenhagen, Denmark", "lat": 55.6761, "lng": 12.5683},
    {"city": "Helsinki, Finland", "lat": 60.1699, "lng": 24.9384},
    {"city": "Reykjavik, Iceland", "lat": 64.1466, "lng": -21.9426},
    {"city": "Tallinn, Estonia", "lat": 59.4370, "lng": 24.7536},
    {"city": "Riga, Latvia", "lat": 56.9496, "lng": 24.1052},
    {"city": "Vilnius, Lithuania", "lat": 54.6872, "lng": 25.2797},
    {"city": "Belgrade, Serbia", "lat": 44.7866, "lng": 20.4489},
    {"city": "Zagreb, Croatia", "lat": 45.8150, "lng": 15.9819},
    {"city": "Sarajevo, Bosnia", "lat": 43.8563, "lng": 18.4131},
    {"city": "Bratislava, Slovakia", "lat": 48.1486, "lng": 17.1077},
    {"city": "Ljubljana, Slovenia", "lat": 46.0569, "lng": 14.5058},

    # ─── Asia ───
    {"city": "Tokyo, Japan", "lat": 35.6762, "lng": 139.6503},
    {"city": "Osaka, Japan", "lat": 34.6937, "lng": 135.5023},
    {"city": "Kyoto, Japan", "lat": 35.0116, "lng": 135.7681},
    {"city": "Yokohama, Japan", "lat": 35.4437, "lng": 139.6380},
    {"city": "Nagoya, Japan", "lat": 35.1815, "lng": 136.9066},
    {"city": "Sapporo, Japan", "lat": 43.0618, "lng": 141.3545},
    {"city": "Fukuoka, Japan", "lat": 33.5904, "lng": 130.4017},
    {"city": "Seoul, South Korea", "lat": 37.5665, "lng": 126.9780},
    {"city": "Busan, South Korea", "lat": 35.1796, "lng": 129.0756},
    {"city": "Incheon, South Korea", "lat": 37.4563, "lng": 126.7052},
    {"city": "Daegu, South Korea", "lat": 35.8714, "lng": 128.6014},
    {"city": "Daejeon, South Korea", "lat": 36.3504, "lng": 127.3845},
    {"city": "Beijing, China", "lat": 39.9042, "lng": 116.4074},
    {"city": "Shanghai, China", "lat": 31.2304, "lng": 121.4737},
    {"city": "Guangzhou, China", "lat": 23.1291, "lng": 113.2644},
    {"city": "Shenzhen, China", "lat": 22.5431, "lng": 114.0579},
    {"city": "Chengdu, China", "lat": 30.5728, "lng": 104.0668},
    {"city": "Wuhan, China", "lat": 30.5928, "lng": 114.3055},
    {"city": "Hangzhou, China", "lat": 30.2741, "lng": 120.1551},
    {"city": "Chongqing, China", "lat": 29.5630, "lng": 106.5516},
    {"city": "Xi'an, China", "lat": 34.3416, "lng": 108.9398},
    {"city": "Tianjin, China", "lat": 39.3434, "lng": 117.3616},
    {"city": "Nanjing, China", "lat": 32.0603, "lng": 118.7969},
    {"city": "Hong Kong", "lat": 22.3193, "lng": 114.1694},
    {"city": "Macau", "lat": 22.1987, "lng": 113.5439},
    {"city": "Taipei, Taiwan", "lat": 25.0330, "lng": 121.5654},
    {"city": "Kaohsiung, Taiwan", "lat": 22.6273, "lng": 120.3014},
    {"city": "Singapore", "lat": 1.3521, "lng": 103.8198},
    {"city": "Bangkok, Thailand", "lat": 13.7563, "lng": 100.5018},
    {"city": "Chiang Mai, Thailand", "lat": 18.7883, "lng": 98.9853},
    {"city": "Phuket, Thailand", "lat": 7.8804, "lng": 98.3923},
    {"city": "Kuala Lumpur, Malaysia", "lat": 3.1390, "lng": 101.6869},
    {"city": "Penang, Malaysia", "lat": 5.4164, "lng": 100.3327},
    {"city": "Jakarta, Indonesia", "lat": -6.2088, "lng": 106.8456},
    {"city": "Surabaya, Indonesia", "lat": -7.2575, "lng": 112.7521},
    {"city": "Bandung, Indonesia", "lat": -6.9175, "lng": 107.6191},
    {"city": "Bali (Denpasar), Indonesia", "lat": -8.6705, "lng": 115.2126},
    {"city": "Manila, Philippines", "lat": 14.5995, "lng": 120.9842},
    {"city": "Cebu City, Philippines", "lat": 10.3157, "lng": 123.8854},
    {"city": "Davao City, Philippines", "lat": 7.1907, "lng": 125.4553},
    {"city": "Hanoi, Vietnam", "lat": 21.0285, "lng": 105.8542},
    {"city": "Ho Chi Minh City, Vietnam", "lat": 10.8231, "lng": 106.6297},
    {"city": "Da Nang, Vietnam", "lat": 16.0544, "lng": 108.2022},
    {"city": "Phnom Penh, Cambodia", "lat": 11.5564, "lng": 104.9282},
    {"city": "Vientiane, Laos", "lat": 17.9757, "lng": 102.6331},
    {"city": "Yangon, Myanmar", "lat": 16.8661, "lng": 96.1951},
    {"city": "New Delhi, India", "lat": 28.6139, "lng": 77.2090},
    {"city": "Mumbai, India", "lat": 19.0760, "lng": 72.8777},
    {"city": "Bengaluru, India", "lat": 12.9716, "lng": 77.5946},
    {"city": "Chennai, India", "lat": 13.0827, "lng": 80.2707},
    {"city": "Hyderabad, India", "lat": 17.3850, "lng": 78.4867},
    {"city": "Kolkata, India", "lat": 22.5726, "lng": 88.3639},
    {"city": "Pune, India", "lat": 18.5204, "lng": 73.8567},
    {"city": "Ahmedabad, India", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur, India", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow, India", "lat": 26.8467, "lng": 80.9462},
    {"city": "Chandigarh, India", "lat": 30.7333, "lng": 76.7794},
    {"city": "Dhaka, Bangladesh", "lat": 23.8103, "lng": 90.4125},
    {"city": "Chittagong, Bangladesh", "lat": 22.3569, "lng": 91.7832},
    {"city": "Colombo, Sri Lanka", "lat": 6.9271, "lng": 79.8612},
    {"city": "Kathmandu, Nepal", "lat": 27.7172, "lng": 85.3240},
    {"city": "Islamabad, Pakistan", "lat": 33.6844, "lng": 73.0479},
    {"city": "Karachi, Pakistan", "lat": 24.8607, "lng": 67.0011},
    {"city": "Lahore, Pakistan", "lat": 31.5204, "lng": 74.3587},
    {"city": "Tashkent, Uzbekistan", "lat": 41.2995, "lng": 69.2401},
    {"city": "Almaty, Kazakhstan", "lat": 43.2220, "lng": 76.8512},
    {"city": "Astana, Kazakhstan", "lat": 51.1694, "lng": 71.4491},
    {"city": "Baku, Azerbaijan", "lat": 40.4093, "lng": 49.8671},
    {"city": "Tbilisi, Georgia", "lat": 41.7151, "lng": 44.8271},
    {"city": "Yerevan, Armenia", "lat": 40.1792, "lng": 44.4991},

    # ─── Middle East ───
    {"city": "Dubai, UAE", "lat": 25.2048, "lng": 55.2708},
    {"city": "Abu Dhabi, UAE", "lat": 24.4539, "lng": 54.3773},
    {"city": "Doha, Qatar", "lat": 25.2854, "lng": 51.5310},
    {"city": "Riyadh, Saudi Arabia", "lat": 24.7136, "lng": 46.6753},
    {"city": "Jeddah, Saudi Arabia", "lat": 21.4858, "lng": 39.1925},
    {"city": "Dammam, Saudi Arabia", "lat": 26.4207, "lng": 50.0888},
    {"city": "Kuwait City, Kuwait", "lat": 29.3759, "lng": 47.9774},
    {"city": "Manama, Bahrain", "lat": 26.2285, "lng": 50.5860},
    {"city": "Muscat, Oman", "lat": 23.5880, "lng": 58.3829},
    {"city": "Amman, Jordan", "lat": 31.9454, "lng": 35.9284},
    {"city": "Beirut, Lebanon", "lat": 33.8938, "lng": 35.5018},
    {"city": "Tel Aviv, Israel", "lat": 32.0853, "lng": 34.7818},
    {"city": "Jerusalem, Israel", "lat": 31.7683, "lng": 35.2137},
    {"city": "Haifa, Israel", "lat": 32.7940, "lng": 34.9896},
    {"city": "Baghdad, Iraq", "lat": 33.3152, "lng": 44.3661},
    {"city": "Erbil, Iraq", "lat": 36.1901, "lng": 44.0091},
    {"city": "Tehran, Iran", "lat": 35.6892, "lng": 51.3890},
    {"city": "Isfahan, Iran", "lat": 32.6546, "lng": 51.6680},

    # ─── Africa ───
    {"city": "Cairo, Egypt", "lat": 30.0444, "lng": 31.2357},
    {"city": "Alexandria, Egypt", "lat": 31.2001, "lng": 29.9187},
    {"city": "Johannesburg, South Africa", "lat": -26.2041, "lng": 28.0473},
    {"city": "Cape Town, South Africa", "lat": -33.9249, "lng": 18.4241},
    {"city": "Durban, South Africa", "lat": -29.8587, "lng": 31.0218},
    {"city": "Pretoria, South Africa", "lat": -25.7479, "lng": 28.2293},
    {"city": "Port Elizabeth, South Africa", "lat": -33.9608, "lng": 25.6022},
    {"city": "Lagos, Nigeria", "lat": 6.5244, "lng": 3.3792},
    {"city": "Abuja, Nigeria", "lat": 9.0765, "lng": 7.3986},
    {"city": "Kano, Nigeria", "lat": 12.0022, "lng": 8.5920},
    {"city": "Nairobi, Kenya", "lat": -1.2921, "lng": 36.8219},
    {"city": "Mombasa, Kenya", "lat": -4.0435, "lng": 39.6682},
    {"city": "Addis Ababa, Ethiopia", "lat": 9.0300, "lng": 38.7400},
    {"city": "Casablanca, Morocco", "lat": 33.5731, "lng": -7.5898},
    {"city": "Rabat, Morocco", "lat": 34.0209, "lng": -6.8416},
    {"city": "Marrakech, Morocco", "lat": 31.6295, "lng": -7.9811},
    {"city": "Algiers, Algeria", "lat": 36.7538, "lng": 3.0588},
    {"city": "Tunis, Tunisia", "lat": 36.8065, "lng": 10.1815},
    {"city": "Tripoli, Libya", "lat": 32.8872, "lng": 13.1913},
    {"city": "Accra, Ghana", "lat": 5.6037, "lng": -0.1870},
    {"city": "Kumasi, Ghana", "lat": 6.6885, "lng": -1.6244},
    {"city": "Dakar, Senegal", "lat": 14.7167, "lng": -17.4677},
    {"city": "Abidjan, Ivory Coast", "lat": 5.3600, "lng": -4.0083},
    {"city": "Luanda, Angola", "lat": -8.8390, "lng": 13.2894},
    {"city": "Maputo, Mozambique", "lat": -25.9692, "lng": 32.5732},
    {"city": "Dar es Salaam, Tanzania", "lat": -6.7924, "lng": 39.2083},
    {"city": "Kampala, Uganda", "lat": 0.3476, "lng": 32.5825},
    {"city": "Kigali, Rwanda", "lat": -1.9706, "lng": 30.1044},
    {"city": "Harare, Zimbabwe", "lat": -17.8252, "lng": 31.0335},
    {"city": "Lusaka, Zambia", "lat": -15.3875, "lng": 28.3228},
    {"city": "Windhoek, Namibia", "lat": -22.5609, "lng": 17.0658},
    {"city": "Gaborone, Botswana", "lat": -24.6282, "lng": 25.9231},

    # ─── Oceania ───
    {"city": "Sydney, Australia", "lat": -33.8688, "lng": 151.2093},
    {"city": "Melbourne, Australia", "lat": -37.8136, "lng": 144.9631},
    {"city": "Brisbane, Australia", "lat": -27.4698, "lng": 153.0251},
    {"city": "Perth, Australia", "lat": -31.9505, "lng": 115.8605},
    {"city": "Adelaide, Australia", "lat": -34.9285, "lng": 138.6007},
    {"city": "Gold Coast, Australia", "lat": -28.0167, "lng": 153.4000},
    {"city": "Canberra, Australia", "lat": -35.2809, "lng": 149.1300},
    {"city": "Newcastle, Australia", "lat": -32.9283, "lng": 151.7817},
    {"city": "Hobart, Australia", "lat": -42.8821, "lng": 147.3272},
    {"city": "Darwin, Australia", "lat": -12.4634, "lng": 130.8456},
    {"city": "Auckland, New Zealand", "lat": -36.8485, "lng": 174.7633},
    {"city": "Wellington, New Zealand", "lat": -41.2865, "lng": 174.7762},
    {"city": "Christchurch, New Zealand", "lat": -43.5321, "lng": 172.6362},
    {"city": "Suva, Fiji", "lat": -18.1248, "lng": 178.4501},
    {"city": "Port Moresby, Papua New Guinea", "lat": -9.4438, "lng": 147.1803},
    {"city": "Noumea, New Caledonia", "lat": -22.2758, "lng": 166.4580},
    {"city": "Papeete, French Polynesia", "lat": -17.5516, "lng": -149.5585}
]

ATTACK_SIGNATURES = {
    "DDoS_Volume_Spike": {"base_features": [0.95, 0.90, 0.85, 0.70, 0.95, 0.10, 0.20, 0.80, 0.90, 0.85]},
    "SQL_Injection":     {"base_features": [0.35, 0.80, 0.65, 0.90, 0.40, 0.75, 0.85, 0.30, 0.60, 0.70]},
    "Port_Scan":         {"base_features": [0.85, 0.20, 0.30, 0.40, 0.80, 0.95, 0.15, 0.25, 0.30, 0.45]},
    "Malware_Drop":      {"base_features": [0.30, 0.95, 0.85, 0.80, 0.25, 0.40, 0.90, 0.70, 0.85, 0.90]},
    "Brute_Force":       {"base_features": [0.75, 0.40, 0.50, 0.60, 0.70, 0.30, 0.50, 0.40, 0.60, 0.65]},
    "Adversarial_Drift": {"base_features": [0.60, 0.75, 0.70, 0.85, 0.65, 0.80, 0.80, 0.65, 0.75, 0.80]}
}

# Major Global Target Hubs / Cloud Gateways
MAJOR_DESTINATIONS = [
    {"name": "Central NOC (New Delhi)", "lat": 28.6139, "lng": 77.2090},
    {"name": "US-East Gateway (Virginia)", "lat": 38.9072, "lng": -77.0369},
    {"name": "US-West Gateway (Silicon Valley)", "lat": 37.7749, "lng": -122.4194},
    {"name": "Europe-Central SOC (Frankfurt)", "lat": 50.1109, "lng": 8.6821},
    {"name": "UK Regional SOC (London)", "lat": 51.5074, "lng": -0.1278},
    {"name": "Asia-Pacific Hub (Singapore)", "lat": 1.3521, "lng": 103.8198},
    {"name": "East Asia Hub (Tokyo)", "lat": 35.6762, "lng": 139.6503},
    {"name": "Australia Gateway (Sydney)", "lat": -33.8688, "lng": 151.2093},
    {"name": "South America Hub (Sao Paulo)", "lat": -23.5505, "lng": -46.6333},
    {"name": "Middle East SOC (Dubai)", "lat": 25.2048, "lng": 55.2708},
    {"name": "France Regional Cloud (Paris)", "lat": 48.8566, "lng": 2.3522},
    {"name": "Nordic Data Center (Stockholm)", "lat": 59.3293, "lng": 18.0686}
]

def generate_stream_packet(drift_intensity=0.0):
    """
    Simulates high-speed aggregated network packet stream (Spark/Kafka output).
    Includes IP addresses, coordinates, and normalized tensor feature vectors.
    """
    # Pick source from 220+ major global hubs or dynamic global coordinates
    if random.random() < 0.85:
        target = random.choice(GLOBAL_TARGETS)
        source_lat = round(target["lat"] + random.uniform(-2.5, 2.5), 4)
        source_lng = round(target["lng"] + random.uniform(-2.5, 2.5), 4)
        city_name = target["city"]
    else:
        # Fully random worldwide geographic origin
        source_lat = round(random.uniform(-55.0, 65.0), 4)
        source_lng = round(random.uniform(-170.0, 175.0), 4)
        city_name = f"Grid [{source_lat:+.1f}°, {source_lng:+.1f}°]"

    # Pick dynamic destination so arcs span across continents, not just one point
    dest = random.choice(MAJOR_DESTINATIONS)
    dest_coord = {"lat": dest["lat"], "lng": dest["lng"]}
    
    # 70% Normal / Low-level, 30% Anomalous / High Threat
    is_attack = random.random() < (0.35 + drift_intensity * 0.4)
    
    if is_attack:
        attack_type = random.choice(list(ATTACK_SIGNATURES.keys()))
        base = ATTACK_SIGNATURES[attack_type]["base_features"]
        # Add realistic network noise + concept drift variance
        noise = np.random.normal(0, 0.08, size=10)
        feature_vector = np.clip(np.array(base) + noise + (drift_intensity * 0.15), 0.0, 1.0).tolist()
    else:
        attack_type = "Normal_Traffic"
        feature_vector = np.clip(np.random.beta(2, 5, size=10) + (drift_intensity * 0.05), 0.0, 1.0).tolist()
        
    source_ip = f"{random.randint(11,223)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"
    
    return {
        "source_ip": source_ip,
        "dest_ip": f"10.{random.randint(0,10)}.{random.randint(0,254)}.{random.randint(1,254)}",
        "source_lat": source_lat,
        "source_long": source_lng,
        "dest_lat": dest_coord["lat"],
        "dest_long": dest_coord["lng"],
        "attack_type": attack_type if is_attack else "Benign_Flow",
        "features": feature_vector,
        "city": city_name,
        "dest_name": dest["name"]
    }

def main():
    print("=" * 65)
    print("🧠 PyTorch NIDS AI Brain & Concept Drift Detector Initializing...")
    print("=" * 65)
    
    detector = ConceptDriftDetector(input_dim=10)
    print(f"✓ PyTorch Autoencoder Model Ready (Device: {detector.device})")
    print(f"✓ Baseline Anomaly Threshold: {detector.anomaly_threshold:.4f}")
    print(f"✓ Streaming results to SOC Backend: {BACKEND_API}\n")

    iteration = 0
    drift_intensity = 0.0
    session = requests.Session()

    try:
        while True:
            iteration += 1
            # Periodically simulate adversarial concept drift injection
            if iteration % 40 == 0:
                drift_intensity = min(1.0, drift_intensity + 0.35)
                print(f"\n⚠️ [CONCEPT DRIFT INJECTION] Data distribution shift P_t(X) != P_t-1(X) [Intensity: {drift_intensity:.1f}]")
            elif iteration % 80 == 0:
                drift_intensity = 0.0
                print("\n🔄 [BASELINE RESET] Traffic stabilizing back to normal distribution.")

            packet = generate_stream_packet(drift_intensity=drift_intensity)
            
            # Pass aggregated feature vector through PyTorch Deep Autoencoder
            threat_analysis = detector.process_features(
                feature_vector=packet["features"],
                metadata={
                    "source_ip": packet["source_ip"],
                    "dest_ip": packet["dest_ip"],
                    "source_lat": packet["source_lat"],
                    "source_long": packet["source_long"],
                    "dest_lat": packet["dest_lat"],
                    "dest_long": packet["dest_long"],
                    "attack_type": packet["attack_type"] if packet["attack_type"] != "Benign_Flow" else "Network_Pulse",
                    "city": packet["city"]
                }
            )

            # Print HUD Log
            status_icon = "🚨" if threat_analysis["severity"] in ["CRITICAL", "HIGH"] else "🛡️"
            print(f"{status_icon} [{threat_analysis['severity']:<8}] {threat_analysis['attack_type']:<22} | "
                  f"Loss: {threat_analysis['reconstruction_error']:.3f} | "
                  f"Drift: {threat_analysis['drift_score']:.3f} | "
                  f"IP: {threat_analysis['source_ip']} ({threat_analysis['city']})")

            # Forward enriched payload to Node.js Backend API via persistent session
            try:
                payload = {
                    "source_ip": threat_analysis["source_ip"],
                    "dest_ip": threat_analysis["dest_ip"],
                    "source_lat": threat_analysis["source_lat"],
                    "source_long": threat_analysis["source_long"],
                    "dest_lat": threat_analysis["dest_lat"],
                    "dest_long": threat_analysis["dest_long"],
                    "attack_type": threat_analysis["attack_type"],
                    "severity": threat_analysis["severity_score"],
                    "drift_score": threat_analysis["drift_score"],
                    "reconstruction_error": threat_analysis["reconstruction_error"],
                    "adaptive_threshold": threat_analysis.get("adaptive_threshold", 0.12),
                    "ewma_loss": threat_analysis.get("ewma_loss", 0.04),
                    "ml_confidence": threat_analysis.get("ml_confidence", 0.92),
                    "feature_attributions": threat_analysis.get("feature_attributions", []),
                    "severity_level": threat_analysis["severity"],
                    "action": threat_analysis["action"],
                    "city": threat_analysis.get("city", "External Host")
                }
                session.post(BACKEND_API, json=payload, timeout=0.8)
            except Exception:
                # Backend might be starting or offline
                pass

            time.sleep(1.0)

    except KeyboardInterrupt:
        print("\nPyTorch NIDS detector stopped safely.")

if __name__ == "__main__":
    main()
