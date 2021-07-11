import "./App.css";
import {
  Card,
  CardContent,
  MenuItem,
  FormControl,
  Select,
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import { prettyPrintStat } from "./util";
const initial = { lat: 74.80746, lng: -40.4796 };

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 14.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(2);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((res) => res.json())
      .then((res) => setCountryInfo(res));
  }, []);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/countries")
      .then((res) => res.json())
      .then((res) => {
        const newlist = res.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2,
        }));

        const sortedData = sortData(res);
        setTableData(sortedData);
        setMapCountries(res);
        setCountries(newlist);
      })
      .catch((err) => {
        setCountries([]);
      });
  }, []);

  const onChangeHandler = (e) => {
    const currCountry = e.target.value;

    const url =
      currCountry === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${currCountry}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setSelectedCountry(currCountry);
        setCountryInfo(res);
        console.log(res.countryInfo);
        setMapCenter({ lat: res.countryInfo.lat, lng: res.countryInfo.long });
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={selectedCountry}
              onChange={onChangeHandler}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country, id) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

              {/* <MenuItem value="worldwide">worldwide</MenuItem>
            <MenuItem value="worldwide">Asia</MenuItem>
            <MenuItem value="worldwide">USA</MenuItem>
            <MenuItem value="worldwide">UK</MenuItem> */}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed={true}
            active={casesType === 'cases'}
            onClick={(e) => setCasesType("cases")}
            title="Total Cases"
            total={prettyPrintStat(countryInfo.cases)}
            cases={prettyPrintStat(countryInfo.todayCases)}
          />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            total={prettyPrintStat(countryInfo.recovered)}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
          />
          <InfoBox
            isRed={true}
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            total={prettyPrintStat(countryInfo.deaths)}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <br />
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
