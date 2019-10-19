/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-undef */
export default class DiagramCreator {
	constructor() {
		this.canvas = document.getElementById("board-canvas");
  }

  imageTo2Bit(imageId) {
    const img = document.getElementById(imageId);
    const ctx = this.canvas.getContext('2d');
    ctx.width = img.width;
    ctx.height = img.height;
    this.canvas.width = img.width;
    this.canvas.height = img.height;    
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
    console.log('image data', imageData);
    const result = [];
    for (let i = 0; i < imageData.length; i += 4) {
      const luma = 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2];
      if (luma > 200) result.push('1');
      else result.push('0');
    }
    let array = listToMatrix(result,img.width).map(a => [a.join('')]);
    array = array.concat.apply([], array);
    return array.join('\n');
  }

  listToMatrix(list, elementsPerSubArray) {
    const matrix = [];
    let i;
    let k;
    for (i = 0, k = -1; i < list.length; i += 1) {
        if (i % elementsPerSubArray === 0) {
            k += 1;
            matrix[k] = [];
        } matrix[k].push(list[i]);
    } return matrix;
  }

  analyzeImage(imageId) {
    return this.ImageTo2Bit(imageId);
  }

	// analyzeImage(imageId) {
  //   const c = document.getElementById("board-canvas");
	// 	const ctx = c.getContext("2d");
  //  const img = document.getElementById(imageId);
	// 	ctx.drawImage(img, 0, 0, c.width, c.height);
  //   const imgData = ctx.getImageData(0, 0, c.width, c.height);
    
  //   const newGrid = [];

  //   console.warn('imgData.data.length', imgData.data.length)

	// 	for (let i = 0; i < imgData.data.length; i += 4) {
  //     if (i % 64 === 0) {
  //       const rgba = {
  //         r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2], a: imgData.data[i + 3]
  //       };
  //       if (rgba.r < 150) {
  //         newGrid.push('*');
  //       } else {
  //         newGrid.push(0);
  //       }
  //     }
  //   }
  //   console.log('got grid')
  //   console.info(newGrid)
  //   return newGrid;
  // }
}
