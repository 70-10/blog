import satori from "satori";
import sharp from "sharp";

async function getFontData() {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700`;

  const css = await (
    await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (!resource) return;

  return await fetch(resource[1]).then((res) => res.arrayBuffer());
}

export async function getOgImage(text: string) {
  const fontData = await getFontData();

  if (!fontData) {
    throw new Error("Failed to load font data");
  }

  const svg = await satori(
    <main
      style={{
        backgroundSize: "800px 400px",
        backgroundImage: "url(https://blog.70-10.net/bg_image.jpg)",
        height: "100%",
        width: "100%",
      }}
    >
      <section
        tw="flex flex-col w-full px-15 py-12 justify-between border"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(80,80,80,0.8) 0%, rgba(120,120,120,0.9) 100%)",
        }}
      >
        <h1 tw="text-5xl text-gray-100">{text}</h1>
        <div tw="flex justify-between items-center">
          <p tw="items-center">
            <img
              tw="h-12 w-12 rounded-full border border-gray-300"
              src="https://avatars.githubusercontent.com/u/5960697?v=4"
              alt="icon"
            />
            <span tw="ml-3 text-gray-100 text-lg">70_10</span>
          </p>
          <p tw="text-gray-100 pr-7">https://blog.70-10.net</p>
        </div>
      </section>
    </main>,
    {
      width: 800,
      height: 400,
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
