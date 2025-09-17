export type SimplePopupProps = Partial<{
  title: string;
  message: string;
  hasReject: boolean;
  noClose: boolean;
  closeOnConfirm: boolean;
  closeOnReject: boolean;
  confirmButtonText: string;
  rejectButtonText: string;

  onConfirm: () => void;
  onReject: () => void;
  onClose: () => void;
}>;
