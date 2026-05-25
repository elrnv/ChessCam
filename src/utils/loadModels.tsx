import * as tf from "@tensorflow/tfjs-core";
import { loadGraphModel, GraphModel } from "@tensorflow/tfjs-converter";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";
import "@tensorflow/tfjs-backend-wasm";
import { MODEL_HEIGHT, MODEL_WIDTH } from "../utils/constants";

const prefersWasm = () => /Android/i.test(navigator.userAgent);

const LoadModels = async (piecesModelRef: any, xcornersModelRef: any) => {
  if ((piecesModelRef.current !== undefined) && (xcornersModelRef.current !== undefined)) {
    return Promise.resolve();
  }

  setWasmPaths("/tfjs-wasm/");
  if (prefersWasm()) {
    await tf.setBackend("wasm");
  } else {
    try {
      await tf.setBackend("webgl");
    } catch (err) {
      console.warn("WebGL backend unavailable, using WASM", err);
      await tf.setBackend("wasm");
    }
  }
  await tf.ready();

  const usingWebgl = tf.getBackend() === "webgl";
  if (usingWebgl) {
    tf.env().set('WEBGL_EXP_CONV', true);
    tf.env().set('WEBGL_PACK', false);
    tf.env().set('ENGINE_COMPILE_ONLY', true);
  }

  try {
    const dummyInput: tf.Tensor<tf.Rank> = tf.zeros([1, MODEL_HEIGHT, MODEL_WIDTH, 3]);

    const piecesModel: GraphModel = await loadGraphModel("480M_pieces_float16/model.json");
    const piecesOutput: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[] = piecesModel.execute(dummyInput);

    const xcornersModel: GraphModel = await loadGraphModel("480L_xcorners_float16/model.json");
    const xcornersOutput: tf.Tensor<tf.Rank> | tf.Tensor<tf.Rank>[]  = xcornersModel.execute(dummyInput);

    tf.dispose([dummyInput, piecesOutput, xcornersOutput]);
    
    if (usingWebgl) {
      const backend: any = tf.backend()
      backend.checkCompileCompletion();
      backend.getUniformLocations();
      tf.env().set('ENGINE_COMPILE_ONLY', false);
    }

    piecesModelRef.current = piecesModel;
    xcornersModelRef.current = xcornersModel;
  } finally {
    if (usingWebgl) {
      tf.env().set('ENGINE_COMPILE_ONLY', false);
    }
  }
};

export default LoadModels;
