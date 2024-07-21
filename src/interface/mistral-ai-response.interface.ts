export interface MistralAiResponseInterface {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}
