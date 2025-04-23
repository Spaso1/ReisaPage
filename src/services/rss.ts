export interface BlogPost {
  title: string;
  link: string;
  content: string;
  creator: string;
  pubDate: string;
  categories?: string[];
  description?: string;
}

export async function fetchBlogPosts(rssUrl: string): Promise<BlogPost[]> {
  try {
    const response = await fetch(rssUrl, {
      headers: {
        Accept: "application/xml, text/xml, */*",
      },
    });
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const items = xmlDoc.querySelectorAll("item");

    return Array.from(items).map((item) => {
      const getElementText = (tagName: string) =>
        item.querySelector(tagName)?.textContent?.trim() || "";

      const getCleanContent = (content: string) => {
        return content.replace("<![CDATA[", "").replace("]]>", "");
      };

      const description = getElementText("description");
      const content = description.includes("CDATA")
        ? getCleanContent(description)
        : description;

      return {
        title: getCleanContent(getElementText("title")),
        link: getElementText("link"),
        content: content,
        creator: "Reisa",
        pubDate: getElementText("pubDate"),
        categories: [getElementText("category")].filter(Boolean),
        description: content,
      };
    });
  } catch (error) {
    console.error("获取博客文章失败:", error);
    return [];
  }
}
