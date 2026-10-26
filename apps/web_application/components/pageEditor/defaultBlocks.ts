import type { PageBlockInput, PageBlockType } from "@/server/lib/pages";

export function nextBlockKey(
  type: PageBlockType,
  blocks: PageBlockInput[]
): string {
  const taken = new Set(blocks.map((block) => block.key));
  let counter = blocks.length + 1;
  while (taken.has(`${type}-${counter}`)) counter += 1;
  return `${type}-${counter}`;
}

export function makeDefaultBlock(
  type: PageBlockType,
  key: string,
  position: number
): PageBlockInput {
  switch (type) {
    case "header":
      return {
        key,
        type,
        position,
        visible: true,
        props: { title: "New header", subtitle: "" },
      };
    case "text":
      return {
        key,
        type,
        position,
        visible: true,
        props: {
          heading: "New section",
          body: "Write something your visitors will love.",
        },
      };
    case "links":
      return {
        key,
        type,
        position,
        visible: true,
        props: {
          style: "stack",
          items: [{ label: "New link", url: "https://example.com" }],
        },
      };
    case "image":
      return {
        key,
        type,
        position,
        visible: true,
        props: { src: "/", alt: "New image", caption: "" },
      };
    case "social":
      return {
        key,
        type,
        position,
        visible: true,
        props: {
          items: [{ network: "Website", url: "https://example.com" }],
        },
      };
    case "product":
      return {
        key,
        type,
        position,
        visible: true,
        props: {
          items: [
            { name: "New product", price: "", url: "https://example.com" },
          ],
        },
      };
    case "video":
      return {
        key,
        type,
        position,
        visible: true,
        props: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "" },
      };
    case "contact":
      return {
        key,
        type,
        position,
        visible: true,
        props: {
          name: "Your name",
          title: "",
          company: "",
          email: "",
          phone: "",
          website: "",
          buttonLabel: "Save contact",
        },
      };
    case "spacer":
      return {
        key,
        type,
        position,
        visible: true,
        props: { height: 32 },
      };
    case "divider":
      return {
        key,
        type,
        position,
        visible: true,
        props: { style: "line" },
      };
  }
}
