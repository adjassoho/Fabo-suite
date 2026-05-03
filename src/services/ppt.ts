import pptxgen from "pptxgenjs";

export interface SlideData {
  title: string;
  bullets: string[];
  imageSuggestion?: string;
}

export const generatePowerPoint = async (title: string, slides: SlideData[]) => {
  let pres = new pptxgen();
  
  pres.layout = "LAYOUT_16x9";
  
  // Title Slide
  let titleSlide = pres.addSlide();
  titleSlide.background = { color: "1E1E1E" };
  titleSlide.addText(title, {
    x: "10%",
    y: "40%",
    w: "80%",
    h: 1.5,
    fontSize: 44,
    color: "F97316",
    bold: true,
    align: "center"
  });

  // Content Slides
  slides.forEach((slideData) => {
    let slide = pres.addSlide();
    slide.background = { color: "1E1E1E" };
    
    // Title
    slide.addText(slideData.title, {
      x: "5%",
      y: "5%",
      w: "90%",
      h: 1,
      fontSize: 32,
      color: "FACC15",
      bold: true,
    });
    
    // Bullets
    const bulletText = slideData.bullets.map(b => ({ text: b, options: { bullet: true, color: "FFFFFF", fontSize: 20, breakLine: true } }));
    
    slide.addText(bulletText, {
      x: "5%",
      y: "20%",
      w: "90%",
      h: "60%",
      valign: "top"
    });
    
    // Image Suggestion Note (Bottom)
    if (slideData.imageSuggestion) {
      slide.addText(`Image suggérée: ${slideData.imageSuggestion}`, {
        x: "5%",
        y: "90%",
        w: "90%",
        h: 0.5,
        fontSize: 12,
        color: "888888",
        italic: true,
      });
    }
  });

  // Save the presentation
  // In Tauri, PptxGenJS uses JS Blob download which triggers the browser's save dialog.
  // Tauri webview handles this natively.
  await pres.writeFile({ fileName: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
};
