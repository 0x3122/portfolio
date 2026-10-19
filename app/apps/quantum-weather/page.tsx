import type { Metadata } from "next";
import Weather from "./weather";

export const metadata: Metadata = {
  title: "Quantum Weather App",
  description: "Current conditions and a seven-day forecast, wherever you are.",
};

export default function WeatherPage() {
  return <Weather />;
}
