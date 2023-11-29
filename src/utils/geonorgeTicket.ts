/* eslint-disable no-console */
// logge en del nå i starten, så kan det fjernes etter vi er helt sikker
// på at det funker som tiltenkt
import WMSCapabilities from "ol/format/WMSCapabilities";
import { getUrlForPath } from "utils/api";

const ticketPrefix = "ticket_";

const parser = new WMSCapabilities();

let ticketConfigSetUpCorrectly = true;

const removeTicketInLocalStorage = (tjenesteId: string) =>
  window.localStorage.removeItem(`${ticketPrefix}${tjenesteId}`);
const setTicketInLocalStorage = (tjenesteId: string, ticket: string) =>
  window.localStorage.setItem(`${ticketPrefix}${tjenesteId}`, ticket);
const getTicketInLocalStorage = (tjenesteId: string) =>
  window.localStorage.getItem(`${ticketPrefix}${tjenesteId}`);

export const getSrcWithTicket = async (tjenesteId: string, src: string) => {
  const ticket = await getTicketForTjeneste(tjenesteId, src);

  return src.concat(`&ticket=${ticket}`);
};

const fetchNewTicket = async (tjenesteId: string) => {
  if (!ticketConfigSetUpCorrectly) return "*";

  try {
    const ticketResponse = await fetch(
      getUrlForPath(`/skbaatts/req?tjenesteid=${tjenesteId}`),
    );
    return ticketResponse.text();
  } catch {
    return "*";
  }
};

export const getTicketForTjeneste = async (tjenesteId: string, src: string) => {
  let existingTicket = getTicketInLocalStorage(tjenesteId);

  if (existingTicket) {
    const isValid = await isTicketValid(existingTicket, src);

    if (isValid) {
      return existingTicket;
    } else {
      removeTicketInLocalStorage(tjenesteId);
    }
  }

  const ticket = await fetchNewTicket(tjenesteId);

  // hvis ticket inneholder stjerne har vi fått en error av tjeneren
  // vi trenger ikke polle endepunktet flere ganger denne sessionen,
  // noe er galt i configen av appen
  if (ticket.includes("*")) {
    ticketConfigSetUpCorrectly = false;
    return "";
  }

  // ticket fetching er async, så vi må sjekke om ticket har blitt satt etter requesten ble fyrt av
  existingTicket = getTicketInLocalStorage(tjenesteId);
  if (existingTicket) {
    return existingTicket;
  }

  setTicketInLocalStorage(tjenesteId, ticket);

  return ticket;
};

const isTicketValid = async (ticket: string, src: string) => {
  let domain = src;

  if (src.includes("?")) {
    domain = src.substring(0, src.indexOf("?"));
  }

  const capabilitiesUrl = `${domain}?ticket=${ticket}&service=WMS&request=GetCapabilities`;

  const response = await fetch(getUrlForPath(capabilitiesUrl));
  const responseText = await response.text();

  const json = parser.read(responseText);

  // om ingen capability har vi fått en exception, så ticket er ikke gyldig
  return json?.Capability;
};
