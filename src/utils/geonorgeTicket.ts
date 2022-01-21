/* eslint-disable no-console */
// logge en del nå i starten, så kan det fjernes etter vi er helt sikker
// på at det funker som tiltenkt
import WMSCapabilities from "ol/format/WMSCapabilities";

const ticketPrefix = "ticket_";

const parser = new WMSCapabilities();

const removeTicketInLocalStore = (tjenesteId: string) =>
  window.localStorage.removeItem(`${ticketPrefix}${tjenesteId}`);
const setTicketInLocalStorage = (tjenesteId: string, ticket: string) =>
  window.localStorage.setItem(`${ticketPrefix}${tjenesteId}`, ticket);
const getTicketInLocalStorage = (tjenesteId: string) =>
  window.localStorage.getItem(`${ticketPrefix}${tjenesteId}`);

export const getSrcWithTicket = async (tjenesteId: string, src: string) => {
  const ticket = await getTicketForTjeneste(tjenesteId, src);
  console.log("Returned ticket", ticket);

  return src.concat(`&ticket=${ticket}`);
};

const fetchNewTicket = async (tjenesteId: string) => {
  console.log("Fetching new ticket");
  const ticketResponse = await fetch(`/skbaatts/req?tjenesteid=${tjenesteId}`);
  return ticketResponse.text();
};

export const getTicketForTjeneste = async (tjenesteId: string, src: string) => {
  let existingTicket = getTicketInLocalStorage(tjenesteId);

  if (existingTicket) {
    const isValid = await isTicketValid(existingTicket, src);

    console.log("Existing ticket found", existingTicket);

    if (isValid) {
      return existingTicket;
    } else {
      removeTicketInLocalStore(tjenesteId);
    }
  }

  const ticket = await fetchNewTicket(tjenesteId);
  console.log("Fetched new ticket", ticket);

  // ticket fetching er async, så vi må sjekke om ticket har blitt satt etter requesten ble fyrt av
  existingTicket = getTicketInLocalStorage(tjenesteId);
  if (existingTicket) {
    console.log("Existing ticket was found after fetching", existingTicket);
    return existingTicket;
  }

  console.log("Setting ticket in local storage", ticket);
  setTicketInLocalStorage(tjenesteId, ticket);

  return ticket;
};

const isTicketValid = async (ticket: string, src: string) => {
  let domain = src;

  if (src.includes("?")) {
    domain = src.substring(0, src.indexOf("?"));
  }

  const capabilitiesUrl = `${domain}?ticket=${ticket}&service=WMS&request=GetCapabilities`;

  const response = await fetch(capabilitiesUrl);
  const responseText = await response.text();

  const json = parser.read(responseText);

  // om ingen capability har vi fått en exception, så ticket er ikke gyldig
  return json?.Capability;
};
