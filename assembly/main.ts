//@nearfile
import { storage, logging } from "near-runtime-ts";

// --- contract code goes below

// export function incrementCounter(value:i32): void {
//   let newCounter = storage.getPrimitive<i32>("counter", 0) + value;
//   storage.set<i32>("counter", newCounter);
//   logging.log("Counter is now: " + newCounter.toString());
// }

// export function decrementCounter(value:i32): void {
//   let newCounter = storage.getPrimitive<i32>("counter", 0) - value;
//   storage.set<i32>("counter", newCounter);
//   logging.log("Counter is now: " + newCounter.toString());
// }

// export function getCounter(): i32 {
//   return storage.getPrimitive<i32>("counter", 0);
// }

// export function resetCounter(): void {
//   storage.set<i32>("counter", 0);
//   logging.log("Counter is reset!")
// }

// // assembly/main.ts
// export function setResponse(apiResponse: string): void {
//   storage.setString("response", apiResponse);
//   logging.log("Response is now: " + apiResponse);
// }

// export function getResponse(): string {
//   return storage.getString("response");
// }

// --- contract code goes below
export function setResponse(apiResponse: string): void {
  storage.setString("response", apiResponse);
  logging.log("Response is now: " + apiResponse);
}

export function getResponse(): string {
  return storage.getString("response");
}

// assembly/main.ts
export function setResponseByKey(key: string, newResponse: string): void {
  storage.setString(key, newResponse);
}

export function getResponseByKey(key: string): string {
  return storage.getString(key);
}