import { useState, useCallback } from 'react';

type ModalType = 'decomposition' | 'overflow' | 'commit' | 'replan' | null;

interface DecompositionData {
  backlogItemId: string;
}

interface OverflowData {
  overflowSubtaskIds: string[];
}

type ModalData = DecompositionData | OverflowData | null;

interface ModalState {
  type: ModalType;
  data: ModalData;
}

export function useModalState() {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    data: null,
  });

  const openDecompositionModal = useCallback((backlogItemId: string) => {
    setModalState({
      type: 'decomposition',
      data: { backlogItemId },
    });
  }, []);

  const openOverflowModal = useCallback((overflowSubtaskIds: string[]) => {
    setModalState({
      type: 'overflow',
      data: { overflowSubtaskIds },
    });
  }, []);

  const openCommitModal = useCallback(() => {
    setModalState({ type: 'commit', data: null });
  }, []);

  const openReplanModal = useCallback(() => {
    setModalState({ type: 'replan', data: null });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null, data: null });
  }, []);

  return {
    modalState,
    isDecompositionOpen: modalState.type === 'decomposition',
    isOverflowOpen: modalState.type === 'overflow',
    isCommitOpen: modalState.type === 'commit',
    isReplanOpen: modalState.type === 'replan',
    decompositionData: modalState.type === 'decomposition' ? (modalState.data as DecompositionData) : null,
    overflowData: modalState.type === 'overflow' ? (modalState.data as OverflowData) : null,
    openDecompositionModal,
    openOverflowModal,
    openCommitModal,
    openReplanModal,
    closeModal,
  };
}
