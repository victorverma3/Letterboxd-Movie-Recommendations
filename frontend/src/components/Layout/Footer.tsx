import discordlogo from "../../images/discordlogo.png";
import emaillogo from "../../images/emaillogo.png";
import githublogo from "../../images/githublogo.png";
import instagramlogo from "../../images/instagramlogo.png";
import letterboxdlogo from "../../images/letterboxdlogo.png";
import linkedinlogo from "../../images/linkedinlogo.png";

const logos = [
    {
        link: "https://letterboxd.com/victorverma",
        image: letterboxdlogo,
        alt: "Letterboxd Logo",
    },
    {
        link: "mailto:victor.verma@icloud.com",
        image: emaillogo,
        alt: "Email Logo,",
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
        link: "https://discord.gg/6Pcfkbeh8C",
        image: discordlogo,
        alt: "Discord Logo",
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
        text: "Feedback/Bugs",
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
                    className="underline shadow-sm hover:decoration-palette-darkbrown hover:opacity-75"
                    href="https://www.victorverma.com/"
                    target="_blank"
                >
                    Victor Verma
                </a>{" "}
                | v1.5.0 |{" "}
                <a
                    className="underline shadow-sm hover:decoration-palette-darkbrown hover:opacity-75"
                    href="/release-notes"
                >
                    Notes
                </a>{" "}
                |{" "}
                <a
                    className="underline shadow-sm hover:decoration-palette-darkbrown hover:opacity-75"
                    href="https://github.com/victorverma3/Letterboxd-Movie-Recommendations"
                    target="_blank"
                >
                    Code
                </a>
            </p>

            <div className="w-full max-w-128 mx-auto flex flex-wrap justify-around gap-4">
                <div className="w-32 flex flex-col space-y-2">
                    <h3 className="mb-2 text-center font-semibold">
                        Stay in Touch
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-around">
                        {logos.map((logo, index) => (
                            <a
                                className="text-black hover:opacity-75 hover:shadow-sm"
                                key={index}
                                href={logo.link}
                                target="_blank"
                            >
                                <img
                                    className="h-7 rounded-lg"
                                    src={logo.image}
                                    alt={logo.alt}
                                />
                            </a>
                        ))}
                    </div>
                </div>
                <ul className="w-fit">
                    <li className="mb-2 font-semibold">Help Out</li>
                    {helpLinks.map((item, index) => (
                        <li key={index}>
                            <a
                                className="underline hover:decoration-palette-darkbrown hover:opacity-75"
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
                This website uses publicly accessible data and is not affiliated
                with Letterboxd
            </p>
        </footer>
    );
};

export default Footer;
