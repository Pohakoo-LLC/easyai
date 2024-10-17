export interface ProjectConfigurationSchema {
  name: string;
  hidden_layers: {
    size: number[];
    type: "Dense" | "Convolution" | "Max pooling";
    config?: {
      filters?: number;
      activation?: "sig" | "ReLU" | "linear" | "Softmax";
    };
  }[];
  input?: {
    type:
      | "Color Image"
      | "Black and White Image"
      | "Audio"
      | "Text"
      | "Identification"
      | "Function of the output"
      | "Other";
    size?: number;
  };
  output?: {
    type: "Color Image" | "Black and White Image" | "Audio" | "Token" | "Identification" | "Other";
    size?: number;
  };
  training_data_path?: string;
  epochs: number;
}
