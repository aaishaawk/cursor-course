export interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
}

export type ToastType = "success" | "delete" | "edit";

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

