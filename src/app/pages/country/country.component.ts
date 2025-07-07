import { Component } from "@angular/core"

@Component({
  selector: "app-country",
  templateUrl: "./country.component.html",
  styleUrls: ["./country.component.scss"],
})
export class CountryComponent {
  countries = [
    "Finland",
    "Sweden",
    "Norway",
    "Denmark",
    "Germany",
    "France",
    "United Kingdom",
    "Spain",
    "Italy",
    "Netherlands",
    "Belgium",
    "Austria",
    "Switzerland",
    "Poland",
    "Czech Republic",
    "Hungary",
    "Portugal",
    "Ireland",
    "Greece",
    "Luxembourg",
  ]
}
