const weatherOption = document.getElementById('selector1');
const timeOption = document.getElementById('selector2');
const weatherSelector = document.getElementById("selector1-div");
const timeSelector = document.getElementById("selector2-div");
const table = document.getElementById('content');
const now = dayjs();
let chartIfExist = null;

const generateRow = async (eventSrc) => {

    const tableName = document.getElementById('table-title');
    const labelName = weatherOption.options[weatherOption.selectedIndex].text;
    tableName.innerHTML = labelName;

    table.innerHTML = "";

    const data = await dataSpitter('https://api.open-meteo.com/v1/forecast?latitude=61.4991&longitude=23.7871&timezone=auto&forecast_minutely_15=96');

    const newRow = document.createElement('div');
    newRow.className = 'row';
    const column1 = document.createElement('div');
    column1.className = 'column1';
    const column2 = document.createElement('div');
    column2.className = 'column2';
    const column3 = document.createElement('div');
    column3.className = 'column3';

    column1.innerHTML = 'Date';
    column2.innerHTML = 'Time';
    column3.innerHTML = 'Value';

    newRow.appendChild(column1);
    newRow.appendChild(column2);
    newRow.appendChild(column3);
    table.appendChild(newRow);

    const formatedTime = [];

    for (let i = 0; i < 20; i++) {
        const newRow = document.createElement('div');
        newRow.className = 'row';

        const column1 = document.createElement('div');
        column1.className = 'column1';
        const column2 = document.createElement('div');
        column2.className = 'column2';
        const column3 = document.createElement('div');
        column3.className = 'column3';

        const time = dayjs(data.date[i]);
        const date = time.format('DD/MM/YYYY');
        const clock = time.format('hh:mm a');
        const property = data.property[i];
        formatedTime.push(date + ' ' + clock);

        column1.innerHTML = date;
        column2.innerHTML = clock;
        column3.innerHTML = property;

        newRow.appendChild(column1);
        newRow.appendChild(column2);
        newRow.appendChild(column3);

        table.appendChild(newRow);
    }
    generateChart(formatedTime, data.property, labelName);
}

const displaySelector = (eventSrc) => {

    Array.from(weatherOption.options).forEach(option => {
        if (option.value === eventSrc.id) {
            option.selected = true;
        }
    });
    Array.from(timeOption.options).forEach(option => {
        if (option.value === 'live') {
            option.selected = true;
        }
    });

    if (eventSrc == document.getElementById('temperature_2m')) {
        weatherSelector.style.display = 'block';
        timeSelector.style.display = 'block';
    } else {
        weatherSelector.style.display = 'none';
        timeSelector.style.display = 'block';
    }
}

const dataSpitter = async (url) => {
    const selectedTime = timeOption.value;
    const selectedWeather = weatherOption.value;
    url = url + selectedTime + '&hourly=' + selectedWeather;
    const response = await fetch(url);
    const data = await response.json();
    const time = data.hourly.time;
    const selectedKey = data.hourly[selectedWeather];
    const returnedObj = {
        date: [],
        property: []
    }

    let index = 0;

    // for(let i = 0; i < time.length; i++) {
    //     const comparedTime = dayjs(time[i]);
    //     if (comparedTime.isAfter(now)) {
    //         index = i - 1;
    //         break;
    //     }

    // }

    for (let i = index; i < 20; i++) {
        returnedObj.date.push(time[i]);
        returnedObj.property.push(selectedKey[i]);
    }

    return returnedObj;
}

const generateChart = (time, inputData, labelName) => {
    const chart = document.getElementById('chart');

    if (chartIfExist) {
        chartIfExist.destroy();
    }

    chartIfExist = new Chart(chart, {
        type: 'bar',
        data: {
            labels: time,
            datasets: [{
                label: labelName,
                data: inputData,
                borderWidth: 1,
                backgroundColor: 'rgba(255, 0, 0, 1)',
                barPercentage: 0.95,
                categoryPercentage: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        callback: function (val, index) {
                            return index % 5 === 0 ? this.getLabelForValue(val) : '';
                        },
                        maxRotation: 0,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

const statistics = async() => {
    const selectedWeather = weatherOption.value;
    const url = 'https://api.open-meteo.com/v1/cma?latitude=52.52&longitude=13.41&past_days=7&forecast_days=0&hourly=' + selectedWeather;
    const response = await fetch(url);
    const data = await response.json();
    const processedData = data.hourly[selectedWeather];

    const meanValue = mean(processedData);
    const medianValue = meadian(processedData);
    const modeValue = mode(processedData);
    const rangeValue = range(processedData);
    const stdValue = std(processedData);
    const minValue = min(processedData);
    const maxValue = max(processedData);
    const confInt95Value = confInt95(processedData);

    const nodeList = document.querySelectorAll(".reset");
    nodeList.forEach(e => e.innerHTML = "");
    const arr = [meanValue, medianValue, modeValue, rangeValue, stdValue, minValue, maxValue, confInt95Value];
    let i = 0;
    nodeList.forEach(e => {
        e.innerHTML = e.id + ': ' + arr[i];
        i++;
    });

}
const sum = (arr) => {
    return arr.reduce((sum, element) => sum + element, 0);
}
const mean = (arr) => {
    const sumValue = sum(arr);
    const meanValue = sumValue / arr.length;
    return round(meanValue);
};
const sort = (arr) => {
    return arr.sort((a, b) => a - b);
}
const meadian = (arr) => {
    arr = sort(arr);
    const mid = Math.floor(arr.length / 2);

    if (arr.length % 2 === 0) {
        return round((arr[mid - 1] + arr[mid]) / 2);
    }

    return round(arr[mid]);
};
const mode = (arr) => {
    arr = sort(arr);
    let frequency = [];
    frequency = arr.map(element => {
        let count = 0;
        arr.forEach(e => {
            if (e == arr) {
                count++;
            }
        });
        return count;
    });

    const maxFreq = max(frequency);
    const index = frequency.findIndex(e => e === maxFreq);

    return round(arr[index]);
};
const range = (arr) => {
    const maxValue = max(arr);
    const minValue = min(arr);
    return round(maxValue - minValue);
};
const std = (arr) => {
    const medianValue = meadian(arr);
    const newArr = arr.map(e => Math.pow(e - medianValue, 2));
    return round(Math.sqrt(sum(newArr) / arr.length));
};
const min = (arr) => {
    arr = sort(arr);
    return round(arr[0]);
};
const max = (arr) => {
    arr = sort(arr);
    return round(arr[arr.length - 1]);
};
const confInt95 = (arr) => {
    const medianValue = meadian(arr);
    const stdValue = std(arr);
    const min = round(medianValue - 1.96 * (stdValue / Math.sqrt(arr.length)));
    const max = round(medianValue + 1.96 * (stdValue / Math.sqrt(arr.length)));

    return `[${min}, ${max}]`;
};
const round = (value) => {
    return Math.round(value * 100) / 100;
}

const tempLabel = document.getElementById('temperature_2m');
const visLabel = document.getElementById('visibility');
const windLabel = document.getElementById('wind_speed_10m');

tempLabel.addEventListener('click', (event) => {
    const nodeList = document.querySelectorAll(".reset");
    nodeList.forEach(e => e.innerHTML = "");
    const eventSrc = event.target;
    displaySelector(eventSrc)
    generateRow(eventSrc)
});
visLabel.addEventListener('click', (event) => {
    const eventSrc = event.target;
    displaySelector(eventSrc);
    generateRow(eventSrc);
    statistics();
});
windLabel.addEventListener('click', (event) => {
    const eventSrc = event.target;
    displaySelector(eventSrc);
    generateRow(eventSrc);
    statistics();
});

const selectorListener = async () => {
    const weather = weatherOption.value;
    const selectedWeather = document.getElementById(weather);
    generateRow(selectedWeather);
}

weatherOption.addEventListener('change', selectorListener);
timeSelector.addEventListener('change', selectorListener);

document.getElementById('temperature_2m').click();