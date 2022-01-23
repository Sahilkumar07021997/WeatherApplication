//..........................Creating different VARIABLES.............................................
let searchInp=document.querySelector('.weather_search');
let city=document.querySelector('.weather_city');
let day=document.querySelector('.weather_day');
let humidity=document.querySelector('.weather_indicator--humidity>.value');
let wind=document.querySelector('.weather_indicator--wind>.value');
let pressure=document.querySelector('.weather_indicator--pressure>.value');
let image=document.querySelector('.weather_image');
let temperature=document.querySelector('.weather_temperature>.value');
let details=document.querySelector('.report');
let forecastBlock=document.querySelector('.weather_forecast');
let suggestions=document.querySelector('#suggestions');

//................city search api connection.......................................................
let cityBaseEndpoint='https://api.teleport.org/api/cities/?search=';


//....................for changing the image according to the weather...............................
let weatherImages=[
    {
        url:'images/clear-sky.png',
        ids: [800]
    },
    {
        url:'images/broken-clouds.png',
        ids: [803,804] 
    },
    {
        url:'images/few-clouds.png',
        ids: [801]
    },
    {
        url:'images/mist.png',
        ids: [701,711,721,731,741,751,761,762,771,781]
    },
    {
        url:'images/rain.png',
        ids: [500,501,502,504]
    },
    {
        url:'images/scattered-clouds.png',
        ids: [802]
    },
    {
        url:'images/shower-rain.png',
        ids: [520,521,522,531,300,301,302,310,311,312,313,314,321]
    },
    {
        url:'images/snow.png',
        ids: [511,601,602,600,611,612,613,615,616,620,621,622]
    },
    {
        url:'images/thunderstorm.png',
        ids: [200,201,202,210,211,212,221,230,231,232]
    }
]

//................................API connection part...............................................
let weatherAPIKey='f236a55be1ca819f5897e871028eb99d';
let weatherBaseEndpoint='https://api.openweathermap.org/data/2.5/weather?units=metric&appid='+weatherAPIKey;

//.................now for the forecast of 5days.........................
let forecastBaseEndPoint='https://api.openweathermap.org/data/2.5/forecast?units=metric&appid='+weatherAPIKey;

let getForecastByCityId= async (id)=> {
    let endpoint=forecastBaseEndPoint + '&id='+ id;

    let result= await fetch(endpoint);
    let forecast= await result.json();
//console.log(forecast); 
    let forecastList=forecast.list;
    let daily=[];

    forecastList.forEach(day => {
        let date=new Date(day.dt_txt.replace(' ','T'))         //converting the date and time in time format..only for single day.
        let hours=date.getHours();
        //console.log(hours);
        if(hours===12) {                                      //for 12:00 noon for each day forcast...
            daily.push(day);
        }
    });
   // console.log(daily);
   return daily;
}

let getWeatherByCityName=async (city)=> {
    let endpoint=weatherBaseEndpoint+'&q='+city;
    
    let response=await fetch(endpoint);
    let weather=await response.json();  //convert the api response into the JS object..

    console.log(weather);
    return weather;
}

//getWeatherByCityName("New York");

//...............................ENTER button event listner handling...................................
searchInp.addEventListener('keydown', async (e) => {
   // console.log(e);                 // u can check the keyevents for ENTER press by console.log
   if(e.key == 'Enter') {            //keycode 13 is for 'ENTER'.
    let weather=await getWeatherByCityName(searchInp.value);
    //console.log(weather);
    updateCurrentWeather(weather);

    let cityID=weather.id;
    let forecast= await getForecastByCityId(cityID);
    updateForecast(forecast);
   }
});

//..........................INPUT search event handling........................................
searchInp.addEventListener('input',async ()=>{
    let endpoint=cityBaseEndpoint + searchInp.value;
    let result= await fetch(endpoint);
    let searchResult=await result.json();
    console.log(searchResult);
    suggestions.innerHTML='';
    let cities=searchResult._embedded['city:search-results'];
    let length=cities.length>5?5:cities.length;  //so, that only 5 cities were shown in search box

    for(let i=0;i<cities.length;i++){
        let option=document.createElement('option');
        option.value=cities[i].matching_full_name;
        suggestions.appendChild(option);
    }

});

//...............................FOR UPDATING CURRENT DATA......................................
let updateCurrentWeather=(data)=> {
    city.textContent=data.name+', '+data.sys.country;
    day.textContent=dayOfWeek();
    humidity.textContent= data.main.humidity;
    pressure.textContent=data.main.pressure;
    //for wind speed and direction...
    let windDirection;
    let deg=data.wind.deg;
    if(deg>45 && deg<=135) windDirection='East';
    else if(deg>135 && deg<=225) windDirection='West';
    else if(deg>225 && deg<=315) windDirection='South';
    else windDirection='North';

    wind.textContent=windDirection+', '+data.wind.speed;

    // for temperature positive and negative
    temperature.textContent=data.main.temp>0? '+'+Math.round(data.main.temp) : Math.round(data.main.temp);
     details.textContent=data.weather[0].main;
   // console.log(data);
    //...for updating the weathr icon....
    let imgID=data.weather[0].id;

    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgID)){
            image.src=obj.url;
        }
    });
}
 

//............................FOR UPDATING 5 day forecast DATA....................................
let updateForecast=(forecast)=>{
    forecastBlock.innerHTML='';
    forecast.forEach(day=>{
        let iconUrl='http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayname=dayOfWeek(day.dt*1000);
        let temperature= day.main.temp>0? '+'+Math.round(day.main.temp) : Math.round(day.main.temp); // for the temp. part

        let forecastItem=`
        <article class="weather_forecast_item">
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather_forecast_icon">
            <h3 class="weather_forecast_day">${dayname}</h3>
            <p class="weather_forecast_temperature"><span class="value">${temperature}</span>&deg; C</p>
        </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem); //updating the forecast articles...........
    })
}




let dayOfWeek = (dt = new Date().getTime())=> {
    return new Date(dt).toLocaleString('en-us', {weekday:'long'});
}