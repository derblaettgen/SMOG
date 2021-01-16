import * as BABYLON from "babylonjs";
import { RangeMap } from "./helper";
import { entity } from "./enum";
import "./styles/app.css";
import { Camera, Vector2, Vector3 } from "babylonjs";

const canvas = document.getElementById("render-canvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true, null, true);
const scene = new BABYLON.Scene(engine);

const boxField: BABYLON.InstancedMesh[] = [];
const boxSize = 0.4;
let parentBox: BABYLON.Mesh;
const fieldSquareSize = 32;
const instanceCount = Math.pow(fieldSquareSize, 2);
let counter = 0;

const initializeScene = () => {
  scene.clearColor = BABYLON.Color4.FromInts(224, 255, 255, 255);

  const camera = new BABYLON.ArcRotateCamera(
    entity.mainCamera,
    0,
    0,
    0,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.setPosition(new BABYLON.Vector3(0, 20, -20));
  camera.attachControl(canvas, true);

  const postProcess = new BABYLON.ImageProcessingPostProcess(
    entity.postProcess,
    1.0,
    camera
  );
  postProcess.vignetteWeight = 0.7;
  postProcess.vignetteStretch = 5;
  postProcess.vignetteColor = new BABYLON.Color4(0, 0, 0, 0);
  postProcess.vignetteEnabled = true;

  // const gl = new BABYLON.GlowLayer(entity.glowLayer, scene, {
  //   mainTextureSamples: 1,
  // });
  // gl.intensity = 0.5;

  const light = new BABYLON.PointLight(
    entity.mainLight,
    new BABYLON.Vector3(0, 100, 0),
    scene
  );
  light.diffuse = new BABYLON.Color3(1, 1, 1);
};

const intializeBoxField = () => {
  // Setup the Material
  const boxMaterial = new BABYLON.StandardMaterial(entity.boxMaterial, scene);
  const boxFieldRoot = new BABYLON.Mesh(entity.boxFieldRoot, scene);

  // Create Parent Box
  parentBox = BABYLON.Mesh.CreateBox("ParentBox", boxSize, scene);
  parentBox.material = boxMaterial;
  parentBox.position = new BABYLON.Vector3(0, -10000, 0);

  // Create Object Field
  for (let i = 0; i < instanceCount; i++) {
    const fieldLength = boxField.push(
      // BABYLON.Mesh.CreateBox(`${entity.boxName}-${i}`, boxSize, scene)
      parentBox.createInstance(`${entity.boxName}-${i}`)
    );
    const meshPos = fieldLength - 1;

    // Offsetting Field to Central Position
    const middleOffset = (fieldSquareSize * boxSize) / 2 - boxSize / 2;
    boxField[meshPos].position.x =
      (i % fieldSquareSize) * boxSize - middleOffset;
    boxField[meshPos].position.z =
      Math.floor(i / fieldSquareSize) * boxSize - middleOffset;

    boxField[meshPos].parent = boxFieldRoot;
  }
};

const renderLoop = () => {
  const sinHeight = 0.6;
  const sinFrequency = 1;
  const sinSpeed = 200;
  let colorData = new Float32Array(4 * instanceCount);

  const inc = (Math.PI * 2) / sinSpeed;
  counter += inc;

  // rotate SinField
  scene.getMeshByName(entity.boxFieldRoot).addRotation(0, 0.0025, 0);

  for (let i = 0; i < instanceCount; i++) {
    const elem = boxField[i];
    elem.position.y =
      Math.sin(
        Math.sqrt(
          Math.pow(elem.position.x / sinFrequency, 2) +
            Math.pow(elem.position.z / sinFrequency, 2)
        ) + counter
      ) * sinHeight;

    const hiColor = { r: 0.8, g: 0.03, b: 0.35 };
    const loColor = { r: 0.48, g: 0.75, b: 0.62 };

    colorData[i * 4] = RangeMap(
      elem.position.y,
      -sinHeight,
      sinHeight,
      loColor.r,
      hiColor.r
    );
    (colorData[i * 4 + 1] = RangeMap(
      elem.position.y,
      -sinHeight,
      sinHeight,
      loColor.g,
      hiColor.g
    )),
      (colorData[i * 4 + 2] = RangeMap(
        elem.position.y,
        -sinHeight,
        sinHeight,
        loColor.b,
        hiColor.b
      ));
    colorData[i * 4 + 3] = 1.0;
  }

  parentBox.setVerticesBuffer(
    new BABYLON.VertexBuffer(
      engine,
      colorData,
      BABYLON.VertexBuffer.ColorKind,
      true,
      false,
      4,
      true
    )
  );

  scene.render();

  // ShowFPS
  const fpsLabel = document.getElementById("fpsLabel");
  fpsLabel.innerHTML = `${engine.getFps().toFixed()} FPS`;
};

initializeScene();
intializeBoxField();
engine.runRenderLoop(renderLoop);

window.addEventListener("resize", () => engine.resize());
