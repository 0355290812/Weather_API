const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Key của bạn cho OpenWeather
const API_KEY = 'bdd3e532f125037ef36883ee554619f5';

let lastCity = 'Ha Noi';

// Danh sách tên các tỉnh thành ở Việt Nam
const vietnamCities = [
  'An Giang', 'Bà Rịa', 'Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 
  'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh', 
  'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 
  'Thừa Thiên Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh', 'Tuyên Quang', 
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTone(str) {
  const map = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  };
  return str.replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, (match) => map[match] || match);
}

// Hàm chuẩn hóa tên tỉnh thành
function normalizeCityName(cityName) {
  return removeVietnameseTone(cityName)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\s/g, '').toLowerCase();
}

// Định nghĩa route GET /q={City name}
app.get('/q=:cityName', async (req, res) => {
    lastCity = req.params.cityName;
  const cityName = req.params.cityName;
  const stateCode = ''; // Để trống nếu không cần
  const countryCode = 'VN'; // Mã quốc gia Việt Nam
  const limit = 1; // Số lượng kết quả giới hạn

  // Tạo URL cho API call để lấy thông tin địa lý
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${stateCode},${countryCode}&limit=${limit}&appid=${API_KEY}`;

  try {
    // Gửi request đến OpenWeather API để lấy thông tin địa lý
    const geoResponse = await axios.get(geoUrl);
    const geoData = geoResponse.data;

    if (geoData.length === 0) {
      res.status(404).send('Không tìm thấy thông tin địa lý của tỉnh thành!');
      return;
    }

    const { lat, lon } = geoData[0];

    // Tạo URL cho API call để lấy thông tin thời tiết hiện tại
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    // Gửi request đến OpenWeather API để lấy thông tin thời tiết
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Tên thành phố nhận được từ OpenWeather
    const cityFromAPI = normalizeCityName(geoData[0].name);

    // Chuẩn hóa danh sách các thành phố Việt Nam để so sánh
    let matchedCity = vietnamCities.find(city => normalizeCityName(city) === normalizeCityName(cityFromAPI));
    console.log(matchedCity);
    // Tìm tên thành phố khớp trong danh sách Việt Nam

    // Nếu không tìm thấy tên thành phố khớp, sử dụng tên từ API
    if (!matchedCity) {
      matchedCity = cityFromAPI;
    }

    // Cập nhật tên thành phố trong kết quả trả về
    weatherData.name = removeVietnameseTone(matchedCity)
                        // .replace(/\s+/g, ' ')
                        .trim()
                        .replace(/\b\w/g, char => char.toUpperCase());

    if (weatherData.name === "Ba Ria" || weatherData.name === "Vung Tau") {
      weatherData.name = "Ba Ria - Vung Tau";
    }

    // Trả về kết quả thời tiết nhận được từ OpenWeather
    res.json(weatherData);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    res.status(500).send('Có lỗi xảy ra!');
  }
});


app.get('/last', async (req, res) => {
    res.redirect(`/q=${lastCity}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
