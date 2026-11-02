import { extractYouTubeId } from "@/server/lib/pages";
import { asString } from "./blockUtils";
import type { BlockRowProps } from "./rowTypes";
import { HeaderBlock } from "./HeaderBlock";
import { TextBlock } from "./TextBlock";
import { LinksBlock } from "./LinksBlock";
import { SocialBlock } from "./SocialBlock";
import { ProductBlock } from "./ProductBlock";
import { ImageBlock, VideoBlock } from "./MediaBlocks";
import { ContactBlock } from "./ContactBlock";
import { DividerBlock, SpacerBlock } from "./SpacerBlocks";

export function BlockRow({ block, ...rest }: BlockRowProps) {
  const props = block.props ?? {};
  const hidden = rest.interactive ? undefined : true;
  const shared = { props, blockKey: block.key, hidden, ...rest };
  switch (block.type) {
    case "header":
      return <HeaderBlock {...shared} />;
    case "text":
      return <TextBlock {...shared} />;
    case "links":
      return <LinksBlock {...shared} />;
    case "social":
      return <SocialBlock {...shared} />;
    case "product":
      return <ProductBlock {...shared} />;
    case "image":
      return <ImageBlock {...shared} />;
    case "video": {
      const videoId = extractYouTubeId(asString(props["url"]));
      const title = asString(props["title"]);
      if (!videoId) return null;
      return (
        <VideoBlock
          videoId={videoId}
          title={title.length > 0 ? title : "Video"}
          compact={rest.compact}
          interactive={rest.interactive}
          row={rest.row}
          subtle={rest.subtle}
        />
      );
    }
    case "contact":
      return <ContactBlock {...shared} />;
    case "spacer":
      return <SpacerBlock {...shared} />;
    case "divider":
      return <DividerBlock {...shared} />;
    default:
      return null;
  }
}
