import type { ReactNode } from 'react';

type ProductLayoutProps = {
	createView: ReactNode;
	editView: ReactNode | null;
	isEditing: boolean;
};

const ProductLayout = ({ createView, editView, isEditing }: ProductLayoutProps) => {
	return (
		<div className="h-full w-full space-y-6">
			{isEditing && editView ? editView : createView}
		</div>
	);
};

export default ProductLayout;