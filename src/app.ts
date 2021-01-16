import * as BABYLON from "babylonjs";
import { RangeMap } from "./helper"
import "./styles/app.css";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true, null, true);
const scene = new BABYLON.Scene(engine);

const boxField: BABYLON.Mesh[] = [];
const boxSize = 0.4;
const fieldSquareSize = 24;
let counter = 0;

const initializeScene = () => {
  scene.clearColor = BABYLON.Color4.FromInts(224, 255, 255, 255);

  const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
  camera.setPosition(new BABYLON.Vector3(0, 3, -2.25));
  camera.attachControl(canvas, true);

  const postProcess = new BABYLON.ImageProcessingPostProcess("processing", 1.0, camera);
  postProcess.vignetteWeight = 0.7;
  postProcess.vignetteStretch = 5;
  postProcess.vignetteColor = new BABYLON.Color4(0, 0, 0, 0);
  postProcess.vignetteEnabled = true;

  const gl = new BABYLON.GlowLayer("glow", scene, { mainTextureSamples: 1 });
  gl.intensity = 0.4;

  const light = new BABYLON.PointLight("light", new BABYLON.Vector3(10, 10, 0), scene);
}

const intializeBoxField = () => {
  // Setup the Material
  const boxMaterial = new BABYLON.StandardMaterial("material", scene);
  const boxFieldRoot = new BABYLON.Mesh("Root", scene);

  // Create Object Field
  for (let i = 0; i < Math.pow(fieldSquareSize, 2); i++) {
    const fieldLength = boxField.push(BABYLON.Mesh.CreateBox("box", boxSize, scene));
    const meshPos = fieldLength - 1;

    // Offsetting Field to Central Position
    const middleOffset = fieldSquareSize * boxSize / 2 - boxSize / 2;
    boxField[meshPos].position.x = (i % fieldSquareSize) * boxSize - middleOffset;
    boxField[meshPos].position.z = Math.floor(i / fieldSquareSize) * boxSize - middleOffset;

    boxField[meshPos].material = boxMaterial.clone(`Material${i}`);
    boxField[meshPos].parent = boxFieldRoot;
  }
}

const renderLoop = () => {

  const sinHeight = 0.6;
  const sinFrequency = 1;
  const sinSpeed = 200;

  const inc = Math.PI * 2 / sinSpeed;
  counter += inc;

  boxField.forEach( (elem) => {
        elem.position.y = Math.sin(
          Math.sqrt(Math.pow(elem.position.x / sinFrequency, 2) + Math.pow(elem.position.z / sinFrequency, 2))
          + counter) * sinHeight;

        const hiColor = { r: 206, g: 8, b: 90 };
        const loColor = { r: 124, g: 192, b: 162};
        // const loColor = { r: 153, g: 208, b: 220};

        const material = elem.material as BABYLON.StandardMaterial;
        const color = BABYLON.Color3
              .FromInts(
                RangeMap(elem.position.y, -sinHeight, sinHeight, loColor.r, hiColor.r),
                RangeMap(elem.position.y, -sinHeight, sinHeight, loColor.g, hiColor.g),
                RangeMap(elem.position.y, -sinHeight, sinHeight, loColor.b, hiColor.b),
              );
        material.diffuseColor = color;
        material.emissiveColor = color;
        elem.material = material;
      });

  // rotate SinField
  scene.getMeshByName("Root").addRotation(0, 0.0025, 0);
  scene.render();

  // ShowFPS
  const fpsLabel = document.getElementById("fpsLabel");
  fpsLabel.innerHTML =  `${engine.getFps().toFixed()} FPS`;
};

initializeScene();
intializeBoxField();
engine.runRenderLoop(renderLoop);

window.addEventListener("resize", () => engine.resize());
