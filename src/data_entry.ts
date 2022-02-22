import { GedcomXData } from './gedcomx';

export interface Page {
  url: string;
  favicon: string;
  title: string;
}

interface SuccessfulMessage {
  result: 'data';
  data: GedcomXData;
}

interface NoMatchMessage {
  result: 'noMatch';
  data: undefined;
}

interface NoDataMessage {
  result: 'noData';
  data: undefined;
}

interface ErrorMessage {
  result: 'error';
  error: any;
  data: undefined;
}

export type DataMessage =
  | SuccessfulMessage
  | NoMatchMessage
  | NoDataMessage
  | ErrorMessage;

export interface DataEntry {
  page: Page;
  data: GedcomXData;
}

export interface ExtensionMessage {
  message: 'addData';
  data: DataEntry[];
}

export interface ResponseMessage {
  response: string;
}
