import {
  Accordion as BaseAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  data: {
    title: string;
    description: string;
  }[];
}

export function Accordion({ data }: Props) {
  return (
    <BaseAccordion type="single" collapsible className="w-full">
      {data.map((item, i) => {
        return (
          <AccordionItem
            key={`item-${i.toFixed()}`}
            value={`item-${i.toFixed()}`}
          >
            <AccordionTrigger className="text-left">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-md">
              <span
                dangerouslySetInnerHTML={{ __html: item.description }}
              ></span>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </BaseAccordion>
  );
}
