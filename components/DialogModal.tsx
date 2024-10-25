import { useRef } from "react";

interface Props {
    btnName: String;
    className?: String;
    children: React.ReactNode;
}

export const DialogModal = ({ btnName, className, children }: Props) => {
    const modalRef = useRef(null);

    const openModal = () => {
        modalRef.current.showModal();
    };

    const closeModal = () => {
        modalRef.current.close();
    };

    return (
        <>
        <div className="flex-grow">
            <button type="button" className="btn btn-secondary w-full" onClick={openModal}>
                {btnName}
            </button>
        </div>
            <dialog
                id="my_modal_5"
                className="modal modal-middle"
                ref={modalRef}
            >
                <div className={`modal-box ${className}`}>
                    {children}
                    <div className="sticky bottom-0 left-0 right-0">
                        <div className="flex justify-end">
                            <button type="button" className="btn" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    )
}