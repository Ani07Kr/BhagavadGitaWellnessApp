export interface CityLocation {
  name: string;
  district?: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  timezoneOffsetHours: number; // Offset from UTC in hours (e.g. +5.5 for IST)
}

// Extensive offline database covering major towns, districts, and spiritual hubs across India & World
export const CITIES_DATABASE: CityLocation[] = [
  // 🇮🇳 Jharkhand
  { name: "Chandrapura", district: "Bokaro", state: "Jharkhand", country: "India", lat: 23.7508, lng: 86.1158, timezoneOffsetHours: 5.5 },
  { name: "Bokaro Steel City", district: "Bokaro", state: "Jharkhand", country: "India", lat: 23.6693, lng: 86.1511, timezoneOffsetHours: 5.5 },
  { name: "Dhanbad", district: "Dhanbad", state: "Jharkhand", country: "India", lat: 23.7957, lng: 86.4304, timezoneOffsetHours: 5.5 },
  { name: "Ranchi", district: "Ranchi", state: "Jharkhand", country: "India", lat: 23.3441, lng: 85.3096, timezoneOffsetHours: 5.5 },
  { name: "Jamshedpur (Tatanagar)", district: "East Singhbhum", state: "Jharkhand", country: "India", lat: 22.8046, lng: 86.2029, timezoneOffsetHours: 5.5 },
  { name: "Deoghar (Baidyanath Dham)", district: "Deoghar", state: "Jharkhand", country: "India", lat: 24.4826, lng: 86.6974, timezoneOffsetHours: 5.5 },
  { name: "Hazaribagh", district: "Hazaribagh", state: "Jharkhand", country: "India", lat: 23.9925, lng: 85.3637, timezoneOffsetHours: 5.5 },
  { name: "Giridih", district: "Giridih", state: "Jharkhand", country: "India", lat: 24.1866, lng: 86.3079, timezoneOffsetHours: 5.5 },
  { name: "Ramgarh", district: "Ramgarh", state: "Jharkhand", country: "India", lat: 23.6332, lng: 85.5149, timezoneOffsetHours: 5.5 },
  { name: "Dumka", district: "Dumka", state: "Jharkhand", country: "India", lat: 24.2676, lng: 87.2494, timezoneOffsetHours: 5.5 },
  { name: "Chaibasa", district: "West Singhbhum", state: "Jharkhand", country: "India", lat: 22.5532, lng: 85.8082, timezoneOffsetHours: 5.5 },
  { name: "Medininagar (Daltonganj)", district: "Palamu", state: "Jharkhand", country: "India", lat: 24.0436, lng: 84.0722, timezoneOffsetHours: 5.5 },
  { name: "Godda", district: "Godda", state: "Jharkhand", country: "India", lat: 24.8267, lng: 87.2144, timezoneOffsetHours: 5.5 },
  { name: "Sahibganj", district: "Sahibganj", state: "Jharkhand", country: "India", lat: 25.2425, lng: 87.6419, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Bihar
  { name: "Patna", district: "Patna", state: "Bihar", country: "India", lat: 25.5941, lng: 85.1376, timezoneOffsetHours: 5.5 },
  { name: "Gaya (Bodh Gaya)", district: "Gaya", state: "Bihar", country: "India", lat: 24.7955, lng: 85.0002, timezoneOffsetHours: 5.5 },
  { name: "Muzaffarpur", district: "Muzaffarpur", state: "Bihar", country: "India", lat: 26.1209, lng: 85.3647, timezoneOffsetHours: 5.5 },
  { name: "Bhagalpur", district: "Bhagalpur", state: "Bihar", country: "India", lat: 25.2425, lng: 86.9842, timezoneOffsetHours: 5.5 },
  { name: "Darbhanga", district: "Darbhanga", state: "Bihar", country: "India", lat: 26.1542, lng: 85.8918, timezoneOffsetHours: 5.5 },
  { name: "Purnia", district: "Purnia", state: "Bihar", country: "India", lat: 25.7771, lng: 87.4753, timezoneOffsetHours: 5.5 },
  { name: "Arrah", district: "Bhojpur", state: "Bihar", country: "India", lat: 25.5541, lng: 84.6667, timezoneOffsetHours: 5.5 },
  { name: "Begusarai", district: "Begusarai", state: "Bihar", country: "India", lat: 25.4182, lng: 86.1272, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Uttar Pradesh
  { name: "Varanasi (Kashi)", district: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lng: 82.9739, timezoneOffsetHours: 5.5 },
  { name: "Ayodhya", district: "Ayodhya", state: "Uttar Pradesh", country: "India", lat: 26.7922, lng: 82.1998, timezoneOffsetHours: 5.5 },
  { name: "Prayagraj (Allahabad)", district: "Prayagraj", state: "Uttar Pradesh", country: "India", lat: 25.4358, lng: 81.8463, timezoneOffsetHours: 5.5 },
  { name: "Mathura", district: "Mathura", state: "Uttar Pradesh", country: "India", lat: 27.4924, lng: 77.6737, timezoneOffsetHours: 5.5 },
  { name: "Vrindavan", district: "Mathura", state: "Uttar Pradesh", country: "India", lat: 27.5806, lng: 77.7006, timezoneOffsetHours: 5.5 },
  { name: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", country: "India", lat: 26.8467, lng: 80.9462, timezoneOffsetHours: 5.5 },
  { name: "Kanpur", district: "Kanpur", state: "Uttar Pradesh", country: "India", lat: 26.4499, lng: 80.3319, timezoneOffsetHours: 5.5 },
  { name: "Gorakhpur", district: "Gorakhpur", state: "Uttar Pradesh", country: "India", lat: 26.7606, lng: 83.3732, timezoneOffsetHours: 5.5 },
  { name: "Agra", district: "Agra", state: "Uttar Pradesh", country: "India", lat: 27.1767, lng: 78.0081, timezoneOffsetHours: 5.5 },
  { name: "Noida", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", country: "India", lat: 28.5355, lng: 77.3910, timezoneOffsetHours: 5.5 },
  { name: "Ghaziabad", district: "Ghaziabad", state: "Uttar Pradesh", country: "India", lat: 28.6692, lng: 77.4538, timezoneOffsetHours: 5.5 },
  { name: "Meerut", district: "Meerut", state: "Uttar Pradesh", country: "India", lat: 28.9845, lng: 77.7064, timezoneOffsetHours: 5.5 },
  { name: "Bareilly", district: "Bareilly", state: "Uttar Pradesh", country: "India", lat: 28.3670, lng: 79.4304, timezoneOffsetHours: 5.5 },
  { name: "Aligarh", district: "Aligarh", state: "Uttar Pradesh", country: "India", lat: 27.8974, lng: 78.0880, timezoneOffsetHours: 5.5 },
  { name: "Jhansi", district: "Jhansi", state: "Uttar Pradesh", country: "India", lat: 25.4484, lng: 78.5685, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Delhi NCR
  { name: "New Delhi", district: "Central Delhi", state: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, timezoneOffsetHours: 5.5 },
  { name: "Gurugram (Gurgaon)", district: "Gurugram", state: "Haryana", country: "India", lat: 28.4595, lng: 77.0266, timezoneOffsetHours: 5.5 },
  { name: "Faridabad", district: "Faridabad", state: "Haryana", country: "India", lat: 28.4089, lng: 77.3178, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Maharashtra
  { name: "Mumbai", district: "Mumbai City", state: "Maharashtra", country: "India", lat: 19.0760, lng: 72.8777, timezoneOffsetHours: 5.5 },
  { name: "Pune", district: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, timezoneOffsetHours: 5.5 },
  { name: "Nagpur", district: "Nagpur", state: "Maharashtra", country: "India", lat: 21.1458, lng: 79.0882, timezoneOffsetHours: 5.5 },
  { name: "Nashik (Trimbakeshwar)", district: "Nashik", state: "Maharashtra", country: "India", lat: 19.9975, lng: 73.7898, timezoneOffsetHours: 5.5 },
  { name: "Chhatrapati Sambhajinagar (Aurangabad)", district: "Aurangabad", state: "Maharashtra", country: "India", lat: 19.8762, lng: 75.3433, timezoneOffsetHours: 5.5 },
  { name: "Shirdi", district: "Ahmednagar", state: "Maharashtra", country: "India", lat: 19.7667, lng: 74.4764, timezoneOffsetHours: 5.5 },
  { name: "Kolhapur", district: "Kolhapur", state: "Maharashtra", country: "India", lat: 16.7050, lng: 74.2433, timezoneOffsetHours: 5.5 },
  { name: "Thane", district: "Thane", state: "Maharashtra", country: "India", lat: 19.2183, lng: 72.9781, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Karnataka, Tamil Nadu, Andhra, Telangana, Kerala
  { name: "Bengaluru (Bangalore)", district: "Bengaluru Urban", state: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, timezoneOffsetHours: 5.5 },
  { name: "Mysuru (Mysore)", district: "Mysuru", state: "Karnataka", country: "India", lat: 12.2958, lng: 76.6394, timezoneOffsetHours: 5.5 },
  { name: "Hubballi-Dharwad", district: "Dharwad", state: "Karnataka", country: "India", lat: 15.3647, lng: 75.1240, timezoneOffsetHours: 5.5 },
  { name: "Hyderabad", district: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lng: 78.4867, timezoneOffsetHours: 5.5 },
  { name: "Warangal", district: "Warangal", state: "Telangana", country: "India", lat: 17.9689, lng: 79.5941, timezoneOffsetHours: 5.5 },
  { name: "Chennai", district: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, timezoneOffsetHours: 5.5 },
  { name: "Madurai", district: "Madurai", state: "Tamil Nadu", country: "India", lat: 9.9252, lng: 78.1198, timezoneOffsetHours: 5.5 },
  { name: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", country: "India", lat: 11.0168, lng: 76.9558, timezoneOffsetHours: 5.5 },
  { name: "Rameswaram", district: "Ramanathapuram", state: "Tamil Nadu", country: "India", lat: 9.2876, lng: 79.3129, timezoneOffsetHours: 5.5 },
  { name: "Tiruchirappalli (Trichy)", district: "Tiruchirappalli", state: "Tamil Nadu", country: "India", lat: 10.7905, lng: 78.7047, timezoneOffsetHours: 5.5 },
  { name: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", country: "India", lat: 17.6868, lng: 83.2185, timezoneOffsetHours: 5.5 },
  { name: "Vijayawada", district: "NTR", state: "Andhra Pradesh", country: "India", lat: 16.5062, lng: 80.6480, timezoneOffsetHours: 5.5 },
  { name: "Tirupati", district: "Tirupati", state: "Andhra Pradesh", country: "India", lat: 13.6288, lng: 79.4192, timezoneOffsetHours: 5.5 },
  { name: "Kochi (Cochin)", district: "Ernakulam", state: "Kerala", country: "India", lat: 9.9312, lng: 76.2673, timezoneOffsetHours: 5.5 },
  { name: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala", country: "India", lat: 8.5241, lng: 76.9366, timezoneOffsetHours: 5.5 },
  { name: "Kozhikode (Calicut)", district: "Kozhikode", state: "Kerala", country: "India", lat: 11.2588, lng: 75.7804, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Gujarat & Rajasthan
  { name: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", country: "India", lat: 23.0225, lng: 72.5714, timezoneOffsetHours: 5.5 },
  { name: "Surat", district: "Surat", state: "Gujarat", country: "India", lat: 21.1702, lng: 72.8311, timezoneOffsetHours: 5.5 },
  { name: "Vadodara (Baroda)", district: "Vadodara", state: "Gujarat", country: "India", lat: 22.3072, lng: 73.1812, timezoneOffsetHours: 5.5 },
  { name: "Rajkot", district: "Rajkot", state: "Gujarat", country: "India", lat: 22.3039, lng: 70.8022, timezoneOffsetHours: 5.5 },
  { name: "Dwarka", district: "Devbhumi Dwarka", state: "Gujarat", country: "India", lat: 22.2442, lng: 68.9685, timezoneOffsetHours: 5.5 },
  { name: "Somnath (Veraval)", district: "Gir Somnath", state: "Gujarat", country: "India", lat: 20.9020, lng: 70.4042, timezoneOffsetHours: 5.5 },
  { name: "Jaipur", district: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lng: 75.7873, timezoneOffsetHours: 5.5 },
  { name: "Jodhpur", district: "Jodhpur", state: "Rajasthan", country: "India", lat: 26.2389, lng: 73.0243, timezoneOffsetHours: 5.5 },
  { name: "Udaipur", district: "Udaipur", state: "Rajasthan", country: "India", lat: 24.5854, lng: 73.7125, timezoneOffsetHours: 5.5 },
  { name: "Kota", district: "Kota", state: "Rajasthan", country: "India", lat: 25.2138, lng: 75.8648, timezoneOffsetHours: 5.5 },
  { name: "Bikaner", district: "Bikaner", state: "Rajasthan", country: "India", lat: 28.0229, lng: 73.3119, timezoneOffsetHours: 5.5 },
  { name: "Ajmer (Pushkar)", district: "Ajmer", state: "Rajasthan", country: "India", lat: 26.4499, lng: 74.6399, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Madhya Pradesh & Chhattisgarh
  { name: "Ujjain (Mahakaleshwar)", district: "Ujjain", state: "Madhya Pradesh", country: "India", lat: 23.1765, lng: 75.7885, timezoneOffsetHours: 5.5 },
  { name: "Indore", district: "Indore", state: "Madhya Pradesh", country: "India", lat: 22.7196, lng: 75.8577, timezoneOffsetHours: 5.5 },
  { name: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", country: "India", lat: 23.2599, lng: 77.4126, timezoneOffsetHours: 5.5 },
  { name: "Jabalpur", district: "Jabalpur", state: "Madhya Pradesh", country: "India", lat: 23.1815, lng: 79.9864, timezoneOffsetHours: 5.5 },
  { name: "Gwalior", district: "Gwalior", state: "Madhya Pradesh", country: "India", lat: 26.2183, lng: 78.1828, timezoneOffsetHours: 5.5 },
  { name: "Omkareshwar", district: "Khandwa", state: "Madhya Pradesh", country: "India", lat: 22.2472, lng: 76.1511, timezoneOffsetHours: 5.5 },
  { name: "Raipur", district: "Raipur", state: "Chhattisgarh", country: "India", lat: 21.2514, lng: 81.6296, timezoneOffsetHours: 5.5 },
  { name: "Bilaspur", district: "Bilaspur", state: "Chhattisgarh", country: "India", lat: 22.0797, lng: 82.1409, timezoneOffsetHours: 5.5 },
  { name: "Durg-Bhilai", district: "Durg", state: "Chhattisgarh", country: "India", lat: 21.1904, lng: 81.2849, timezoneOffsetHours: 5.5 },

  // 🇮🇳 Uttarakhand, Himachal, Punjab, Haryana, J&K
  { name: "Haridwar", district: "Haridwar", state: "Uttarakhand", country: "India", lat: 29.9457, lng: 78.1642, timezoneOffsetHours: 5.5 },
  { name: "Rishikesh", district: "Dehradun", state: "Uttarakhand", country: "India", lat: 30.0869, lng: 78.2676, timezoneOffsetHours: 5.5 },
  { name: "Dehradun", district: "Dehradun", state: "Uttarakhand", country: "India", lat: 30.3165, lng: 78.0322, timezoneOffsetHours: 5.5 },
  { name: "Kedarnath", district: "Rudraprayag", state: "Uttarakhand", country: "India", lat: 30.7352, lng: 79.0669, timezoneOffsetHours: 5.5 },
  { name: "Badrinath", district: "Chamoli", state: "Uttarakhand", country: "India", lat: 30.7433, lng: 79.4938, timezoneOffsetHours: 5.5 },
  { name: "Nainital", district: "Nainital", state: "Uttarakhand", country: "India", lat: 29.3919, lng: 79.4542, timezoneOffsetHours: 5.5 },
  { name: "Shimla", district: "Shimla", state: "Himachal Pradesh", country: "India", lat: 31.1048, lng: 77.1734, timezoneOffsetHours: 5.5 },
  { name: "Dharamshala", district: "Kangra", state: "Himachal Pradesh", country: "India", lat: 32.2190, lng: 76.3234, timezoneOffsetHours: 5.5 },
  { name: "Amritsar (Golden Temple)", district: "Amritsar", state: "Punjab", country: "India", lat: 31.6340, lng: 74.8723, timezoneOffsetHours: 5.5 },
  { name: "Ludhiana", district: "Ludhiana", state: "Punjab", country: "India", lat: 30.9010, lng: 75.8573, timezoneOffsetHours: 5.5 },
  { name: "Chandigarh", district: "Chandigarh", state: "Chandigarh", country: "India", lat: 30.7333, lng: 76.7794, timezoneOffsetHours: 5.5 },
  { name: "Srinagar", district: "Srinagar", state: "Jammu and Kashmir", country: "India", lat: 34.0837, lng: 74.7973, timezoneOffsetHours: 5.5 },
  { name: "Jammu", district: "Jammu", state: "Jammu and Kashmir", country: "India", lat: 32.7266, lng: 74.8570, timezoneOffsetHours: 5.5 },

  // 🇮🇳 West Bengal, Odisha, Assam & North East
  { name: "Kolkata", district: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lng: 88.3639, timezoneOffsetHours: 5.5 },
  { name: "Howrah", district: "Howrah", state: "West Bengal", country: "India", lat: 22.5958, lng: 88.2636, timezoneOffsetHours: 5.5 },
  { name: "Siliguri", district: "Darjeeling", state: "West Bengal", country: "India", lat: 26.7271, lng: 88.3953, timezoneOffsetHours: 5.5 },
  { name: "Asansol", district: "Paschim Bardhaman", state: "West Bengal", country: "India", lat: 23.6739, lng: 86.9524, timezoneOffsetHours: 5.5 },
  { name: "Durgapur", district: "Paschim Bardhaman", state: "West Bengal", country: "India", lat: 23.5204, lng: 87.3119, timezoneOffsetHours: 5.5 },
  { name: "Bhubaneswar", district: "Khordha", state: "Odisha", country: "India", lat: 20.2961, lng: 85.8245, timezoneOffsetHours: 5.5 },
  { name: "Puri (Jagannath Dham)", district: "Puri", state: "Odisha", country: "India", lat: 19.8135, lng: 85.8312, timezoneOffsetHours: 5.5 },
  { name: "Cuttack", district: "Cuttack", state: "Odisha", country: "India", lat: 20.4625, lng: 85.8828, timezoneOffsetHours: 5.5 },
  { name: "Rourkela", district: "Sundargarh", state: "Odisha", country: "India", lat: 22.2604, lng: 84.8536, timezoneOffsetHours: 5.5 },
  { name: "Guwahati (Kamakhya)", district: "Kamrup Metropolitan", state: "Assam", country: "India", lat: 26.1445, lng: 91.7362, timezoneOffsetHours: 5.5 },
  { name: "Shillong", district: "East Khasi Hills", state: "Meghalaya", country: "India", lat: 25.5788, lng: 91.8933, timezoneOffsetHours: 5.5 },

  // 🌍 Global Major Cities
  { name: "Kathmandu", state: "Bagmati", country: "Nepal", lat: 27.7172, lng: 85.3240, timezoneOffsetHours: 5.75 },
  { name: "Pokhara", state: "Gandaki", country: "Nepal", lat: 28.2096, lng: 83.9856, timezoneOffsetHours: 5.75 },
  { name: "Colombo", state: "Western", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, timezoneOffsetHours: 5.5 },
  { name: "Dubai", state: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708, timezoneOffsetHours: 4 },
  { name: "Abu Dhabi", state: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lng: 54.3773, timezoneOffsetHours: 4 },
  { name: "Singapore", state: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, timezoneOffsetHours: 8 },
  { name: "Kuala Lumpur", state: "Federal Territory", country: "Malaysia", lat: 3.1390, lng: 101.6869, timezoneOffsetHours: 8 },
  { name: "Bangkok", state: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, timezoneOffsetHours: 7 },
  { name: "London", state: "England", country: "United Kingdom", lat: 51.5074, lng: -0.1278, timezoneOffsetHours: 0 },
  { name: "New York", state: "New York", country: "United States", lat: 40.7128, lng: -74.0060, timezoneOffsetHours: -5 },
  { name: "San Francisco", state: "California", country: "United States", lat: 37.7749, lng: -122.4194, timezoneOffsetHours: -8 },
  { name: "Los Angeles", state: "California", country: "United States", lat: 34.0522, lng: -118.2437, timezoneOffsetHours: -8 },
  { name: "Chicago", state: "Illinois", country: "United States", lat: 41.8781, lng: -87.6298, timezoneOffsetHours: -6 },
  { name: "Houston", state: "Texas", country: "United States", lat: 29.7604, lng: -95.3698, timezoneOffsetHours: -6 },
  { name: "Toronto", state: "Ontario", country: "Canada", lat: 43.6532, lng: -79.3832, timezoneOffsetHours: -5 },
  { name: "Vancouver", state: "British Columbia", country: "Canada", lat: 49.2827, lng: -123.1207, timezoneOffsetHours: -8 },
  { name: "Sydney", state: "New South Wales", country: "Australia", lat: -33.8688, lng: 151.2093, timezoneOffsetHours: 10 },
  { name: "Melbourne", state: "Victoria", country: "Australia", lat: -37.8136, lng: 144.9631, timezoneOffsetHours: 10 },
  { name: "Tokyo", state: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezoneOffsetHours: 9 },
  { name: "Berlin", state: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, timezoneOffsetHours: 1 },
  { name: "Paris", state: "Île-de-France", country: "France", lat: 48.8566, lng: 2.3522, timezoneOffsetHours: 1 },
];

/**
 * Estimates timezone offset from longitude if country is not standard
 */
function estimateTimezoneOffset(country: string, lng: number): number {
  const c = country.toLowerCase();
  if (c.includes("india") || c.includes("bharat")) return 5.5;
  if (c.includes("nepal")) return 5.75;
  if (c.includes("sri lanka")) return 5.5;
  if (c.includes("bangladesh")) return 6;
  if (c.includes("pakistan")) return 5;
  if (c.includes("united arab emirates") || c.includes("uae") || c.includes("dubai")) return 4;
  if (c.includes("united kingdom") || c.includes("uk")) return 0;
  if (c.includes("singapore")) return 8;
  if (c.includes("japan")) return 9;
  if (c.includes("australia")) return 10;

  // Approximate standard timezone from longitude (-180 to +180 -> -12 to +12)
  return Math.round((lng / 15) * 2) / 2;
}

/**
 * Live Universal Geocoding search that finds ANY village, town, district, city in India and globally
 */
export async function searchCitiesLive(query: string, maxResults: number = 8): Promise<CityLocation[]> {
  if (!query || query.trim().length < 2) return [];
  const normalized = query.toLowerCase().trim();

  // 1. Check local indexed dataset first for instant matching
  const localMatches = CITIES_DATABASE.filter((city) => {
    return (
      city.name.toLowerCase().includes(normalized) ||
      (city.district && city.district.toLowerCase().includes(normalized)) ||
      (city.state && city.state.toLowerCase().includes(normalized)) ||
      city.country.toLowerCase().includes(normalized)
    );
  }).slice(0, maxResults);

  // 2. Fetch live from OpenStreetMap Photon Geocoding API for every village, town, city
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const liveResults: CityLocation[] = data.features.map((item: any) => {
          const props = item.properties || {};
          const coords = item.geometry?.coordinates || [0, 0];
          const lng = coords[0];
          const lat = coords[1];

          const name = props.name || props.city || props.town || props.village || props.district || query;
          const district = props.district || props.county || props.city;
          const state = props.state || props.region;
          const country = props.country || "India";

          return {
            name,
            district,
            state,
            country,
            lat,
            lng,
            timezoneOffsetHours: estimateTimezoneOffset(country, lng),
          };
        });

        // Combine local matches + live results (deduplicating by close lat/lng)
        const combined = [...localMatches];
        for (const live of liveResults) {
          const isDuplicate = combined.some(
            (c) => Math.abs(c.lat - live.lat) < 0.05 && Math.abs(c.lng - live.lng) < 0.05
          );
          if (!isDuplicate) {
            combined.push(live);
          }
        }

        return combined.slice(0, maxResults);
      }
    }
  } catch (err) {
    // Network offline or timeout - fallback smoothly to local matches
  }

  return localMatches;
}

/**
 * Synchronous search for immediate fallback
 */
export function searchCities(query: string, maxResults: number = 8): CityLocation[] {
  if (!query || query.trim().length === 0) return [];
  const normalized = query.toLowerCase().trim();

  return CITIES_DATABASE.filter((city) => {
    return (
      city.name.toLowerCase().includes(normalized) ||
      (city.district && city.district.toLowerCase().includes(normalized)) ||
      (city.state && city.state.toLowerCase().includes(normalized)) ||
      city.country.toLowerCase().includes(normalized)
    );
  }).slice(0, maxResults);
}
