import githublogo from "../../images/githublogo.png";
import instagramlogo from "../../images/instagramlogo.png";
import letterboxdlogo from "../../images/letterboxdlogo.png";
import linkedinlogo from "../../images/linkedinlogo.png";

const navItems = [
    { text: "Recommendations", url: "/" },
    { text: "Statistics", url: "/statistics" },
    { text: "Watchlist", url: "/watchlist" },
    { text: "FAQ", url: "/frequently-asked-questions" },
    { text: "Metrics", url: "/metrics" },
];

const logos = [
    {
        link: "https://letterboxd.com/victorverma",
        image: letterboxdlogo,
        alt: "Letterboxd Logo",
    },
    {
        link: "https://www.linkedin.com/in/victorverma",
        image: linkedinlogo,
        alt: "LinkedIn Logo",
    },
    {
        link: "https://github.com/victorverma3",
        image: githublogo,
        alt: "GitHub Logo",
    },
    {
        link: "https://www.instagram.com/vic_verma",
        image: instagramlogo,
        alt: "Instagram Logo",
    },
];

const helpLinks = [
    {
        text: "Suggestions",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSeivnNORLWCoFBQNkB1GSh27Zb0ZkzZGUai7fYJveiLYzuwoA/viewform?usp=header",
    },
    {
        text: "Feedback and Bugs",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSfjRGNe8ORq0twg8hhzXiC3dNCqFErf3upZFuKtaafzrhgv0g/viewform?usp=header",
    },
    { text: "Donations", link: "https://ko-fi.com/victorverma" },
];

const Footer = () => {
    return (
        <footer className="mt-8 p-4 flex flex-col space-y-4 bg-palette-lightbrown">
            <p className="w-fit mx-auto text-center text-sm">
                Created by{" "}
                <a
                    className="underline shadow-sm"
                    href="https://www.victorverma.com/"
                    target="_blank"
                >
                    Victor Verma
                </a>{" "}
                | v1.3.1
            </p>

            <div className="w-full max-w-192 mx-auto flex flex-wrap justify-around gap-4">
                <ul className="w-40">
                    <li className="mb-2 font-semibold">Menu</li>
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <a className="hover:underline" href={item.url}>
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="w-40 flex flex-col space-y-2">
                    <h3 className="font-semibold">Stay in Touch</h3>
                    <a className="hover:underline" href="mailto:vpverm@bu.edu">
                        vpverm@bu.edu
                    </a>
                    <div className="flex space-x-2">
                        {logos.map((logo, index) => (
                            <a
                                className="hover:opacity-75 hover:shadow-sm"
                                key={index}
                                href={logo.link}
                                target="_blank"
                            >
                                <img
                                    className="rounded-lg h-7"
                                    src={logo.image}
                                    alt={logo.alt}
                                />
                            </a>
                        ))}
                    </div>
                </div>
                <ul className="w-40">
                    <li className="mb-2 font-semibold">Help Out</li>
                    {helpLinks.map((item, index) => (
                        <li key={index}>
                            <a
                                className="hover:underline"
                                href={item.link}
                                target="_blank"
                            >
                                {item.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="w-fit mx-auto text-center text-sm italic">
                This project uses publicly accessible data and is not affiliated
                with Letterboxd
            </p>
        </footer>
    );
};

export default Footer;