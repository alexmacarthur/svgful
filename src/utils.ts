interface EventProps {
  [key: string]: string | number | boolean;
}

declare global {
  interface Window {
    plausible: (eventName: string, eventProps: { props: EventProps }) => void;
  }
}

export function sendEvent(eventName: string, eventProps: EventProps = {}) {
  eventProps.path = window.location.pathname;

  if (!window.plausible || import.meta.env.NODE_ENV === "development") {
    return console.log({
      event_name: eventName,
      event_data: eventProps,
    });
  }

  window.plausible(eventName, {
    props: eventProps,
  });
}
