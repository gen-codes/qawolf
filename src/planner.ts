import { eventWithTime, metaEvent, mousemoveData } from "rrweb/typings/types";
import { BrowserAction, Workflow } from "./workflow";
import { qaEventWithTime } from "./events";

export const findHref = (events: eventWithTime[]): string =>
  (events[0] as metaEvent).data.href;

export const orderEventsByTime = (
  events: eventWithTime[]
): qaEventWithTime[] => {
  const orderedEvents = [];

  for (let originalEvent of events) {
    let event = JSON.parse(JSON.stringify(originalEvent));

    // replace negative timeOffsets so we can correctly order events by timestamp
    const positions =
      (event.data && (event.data as mousemoveData).positions) || [];
    if (positions.length) {
      const firstOffset = positions[0].timeOffset;
      event.timestamp += firstOffset;
      for (const position of positions) {
        position.timeOffset -= firstOffset;
      }
    }

    orderedEvents.push(event);
  }

  orderedEvents.sort((a, b) => a.timestamp - b.timestamp);

  orderedEvents.forEach((event, index) => (event.id = index));

  return orderedEvents;
};

export const isMouseDownEvent = (event: qaEventWithTime | null): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  return !!(data.source === 2 && data.type === 1 && data.isTrusted);
};

export const isTypeEvent = (event: qaEventWithTime | null): boolean => {
  if (!event || !event.data) return false;

  const data = event.data;
  return !!(data.source === 5 && data.isTrusted && data.text);
};

export const planClickActions = (
  events: qaEventWithTime[]
): BrowserAction[] => {
  const actions: BrowserAction[] = [];

  for (let event of events) {
    if (!isMouseDownEvent(event)) continue;

    actions.push({
      sourceEventId: event.id,
      target: {
        xpath: event.data.xpath!
      },
      type: "click"
    });
  }

  return actions;
};

export const planTypeActions = (events: qaEventWithTime[]): BrowserAction[] => {
  const actions: BrowserAction[] = [];

  let lastXpath = null;

  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (!isTypeEvent(event)) continue;

    // only include last consecutive type per xpath
    if (event.data.xpath === lastXpath) continue;

    actions.push({
      sourceEventId: event.id,
      target: {
        xpath: event.data.xpath!
      },
      type: "type",
      value: event.data.text
    });

    lastXpath = event.data.xpath;
  }

  return actions;
};

export const planWorkflow = (originalEvents: eventWithTime[]): Workflow => {
  const href = findHref(originalEvents);

  const events = orderEventsByTime(originalEvents);

  const steps: BrowserAction[] = planClickActions(events).concat(
    planTypeActions(events)
  );

  steps.sort((a, b) => a.sourceEventId - b.sourceEventId);

  const workflow = { href, steps };
  return workflow;
};
