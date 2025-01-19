interface PageTitleProps {
    title: string;
}

const PageTitle = (props: PageTitleProps) => {
    return (
        <h1 className="w-96 max-w-full mx-auto mt-8 text-center text-4xl text-palette-darkbrown">
            {props.title}
        </h1>
    );
};

export default PageTitle;
