import satori from "satori";
import sharp from "sharp";

async function getFontData() {
  const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP`;

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
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) return;

  return await fetch(resource[1]).then((res) => res.arrayBuffer());
}

export async function getOgImage(text: string) {
  const fontData = (await getFontData()) as ArrayBuffer;

  const svg = await satori(
    <main
      tw="px-10"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(56, 72, 55, 1), rgba(36, 130, 83, 1))",
        height: "100%",
        width: "100%",
      }}
    >
      <section tw="flex flex-col justify-center">
        <h1 tw="text-6xl font-extraold text-white">{text}</h1>
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
    }
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
