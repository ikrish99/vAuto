import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public title = 'vAuto';
  private URL: string = 'https://vautointerview.azurewebsites.net/api';
  private DATA_SET_ID: string = '/datasetId';
  private STORAGE = window.localStorage;
  private KEY = 'vAuto';
  public INFO: any = {};
  public LATEST_INFO: any = {};
  public MYSET: any = {};
  public POST_INFO: any = {};
  public MESSAGE: string = 'BELOW INFO IS COMING FROM LOCAL STORAGE';
  public CODE: string = '';

  constructor(private _http: HttpClient) {
    this.INFO.dealers = [];
    this.LATEST_INFO.dealers = [];
    this.getLocalInfo();
    this.getInfo();
    this.getCode();
  }

  async getInfo() {

    try {
      let dataSetPromise: any = await this._http.get(`${this.URL}${this.DATA_SET_ID}`).toPromise();
      let dataSet = dataSetPromise.datasetId;
      let vehicles: any = await this._http.get(`${this.URL}/${dataSet}/vehicles`).toPromise();

      for (var i = 0; i < vehicles.vehicleIds.length; i++) {
        let id = vehicles.vehicleIds[i];
        let vehicleInfo: any = await this._http.get(`${this.URL}/${dataSet}/vehicles/${id}`).toPromise();

        let temp: VehicleInfo = {
          make: null,
          model: null,
          vehicleId: null,
          year: null
        };

        temp.make = vehicleInfo.make;
        temp.model = vehicleInfo.model;
        temp.vehicleId = vehicleInfo.vehicleId;
        temp.year = vehicleInfo.year;

        if (this.MYSET[vehicleInfo.dealerId]) {
          this.MYSET[vehicleInfo.dealerId].push(temp);
        } else {
          this.MYSET[vehicleInfo.dealerId] = [];
          this.MYSET[vehicleInfo.dealerId].push(temp);
        }

        if (i == (vehicles.vehicleIds.length - 1)) {

          for (const element in this.MYSET) {
            let dealerInfo: any = await this._http.get(`${this.URL}/${dataSet}/dealers/${element}`).toPromise();

            let totalInfo: DealerInfo = {
              dealerId: null,
              name: null,
              vehicles: []
            }

            totalInfo.dealerId = element;
            totalInfo.vehicles = this.MYSET[element];
            totalInfo.name = dealerInfo.name;

            this.LATEST_INFO.dealers.push(totalInfo);
            this.STORAGE.setItem(this.KEY, JSON.stringify(this.LATEST_INFO));
          };
          this.getLocalInfo();

          this.POST_INFO = await this._http.post(`${this.URL}/${dataSet}/answer`, this.LATEST_INFO).toPromise();
          this.MESSAGE = 'INFO IS UP TO DATE'

        }
      };

    } catch (e) {
      console.error('ERR:API_CALL_FAILED', e);
      alert("Please refresh the page");
    }

  }

  getLocalInfo() {
    if (this.STORAGE.getItem(this.KEY)) {
      this.INFO = JSON.parse(this.STORAGE.getItem(this.KEY));
    }
  }

  getCode() {
    this.CODE = `
    // I wrote everything in one function, So that Interviewer can understand my Code
    try {
      // Get the DataSet ID
      let dataSetPromise: any = await this._http.get(\`${this.URL}${this.DATA_SET_ID}\`).toPromise();
      let dataSet = dataSetPromise.datasetId;
      // Get the list of vehicles by providing DataSet ID
      let vehicles: any = await this._http.get(\`${this.URL}/<dataSet>/vehicles\`).toPromise();

      // Iterate the list of Vehicles to get Vehicle info and dealer ID
      for (var i = 0; i < vehicles.vehicleIds.length; i++) {
        let id = vehicles.vehicleIds[i];
        let vehicleInfo: any = await this._http.get(\`${this.URL}/<dataSet>/vehicles/<vehicleId>\`).toPromise();

        let temp: VehicleInfo = {
          make: null,
          model: null,
          vehicleId: null,
          year: null
        };

        // Put the current Vehicle info to temp object
        temp.make = vehicleInfo.make;
        temp.model = vehicleInfo.model;
        temp.vehicleId = vehicleInfo.vehicleId;
        temp.year = vehicleInfo.year;

        // I created a Set object to save the dealer ID as key and list of Vehicle info as value
        // Check the dealer ID is in the Set. If Yes push it, If no then create the key and push the first Vehicle value
        if (this.MYSET[vehicleInfo.dealerId]) {
          this.MYSET[vehicleInfo.dealerId].push(temp);
        } else {
          this.MYSET[vehicleInfo.dealerId] = [];
          this.MYSET[vehicleInfo.dealerId].push(temp);
        }

        // Check the for loop is going to end. Once I get the last Vehical info
        if (i == (vehicles.vehicleIds.length - 1)) {

          // Iterate myset to get the dealar name from dealar api
          for (const element in this.MYSET) {
            // Get Dealer info
            let dealerInfo: any = await this._http.get(\`${this.URL}/<dataSet>/dealers/<dealersId>\`).toPromise();

            let totalInfo: DealerInfo = {
              dealerId: null,
              name: null,
              vehicles: []
            }

            // Add the dealar name and myset value to dealer.vehicals
            totalInfo.dealerId = element;
            totalInfo.vehicles = this.MYSET[element];
            totalInfo.name = dealerInfo.name;

            this.LATEST_INFO.dealers.push(totalInfo);
            // Set this value in Local storage and Get it on load.
            // This also updates on page load / reload.
            this.STORAGE.setItem(this.KEY, JSON.stringify(this.LATEST_INFO));
          };
          // Update the latest info to the page
          this.getLocalInfo();

          // Post the response to answer api
          this.POST_INFO = await this._http.post(\`${this.URL}/<dataSet>/answer\`, this.LATEST_INFO).toPromise();
          this.MESSAGE = 'INFO IS UP TO DATE'

        }
      };

    } catch (e) {
      // If anything goes wrong. Show the alert
      console.error('ERR:API_CALL_FAILED', e);
      alert("Please refresh the page");
    }`
  }

}

interface VehicleInfo {
  vehicleId: string,
  year: string,
  make: string,
  model: string
}

interface DealerInfo {
  dealerId: string,
  name: string,
  vehicles: any
}