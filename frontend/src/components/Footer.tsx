import emaillogo from "../images/emaillogo.png";
import githublogo from "../images/githublogo.png";
import instagramlogo from "../images/instagramlogo.png";
import letterboxdlogo from "../images/letterboxdlogo.png";
import linkedinlogo from "../images/linkedinlogo.png";

const Footer = () => {
    const logos = [
        {
            link: "mailto:victor.verma@hotmail.com",
            image: emaillogo,
            alt: "Email Logo",
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
            link: "https://letterboxd.com/victorverma",
            image: letterboxdlogo,
            alt: "Letterboxd Logo",
        },
        {
            link: "https://www.instagram.com/vic_verma",
            image: instagramlogo,
            alt: "Instagram Logo",
        },
    ];
    return (
        <div>
            <hr />
            <p className="w-fit mx-auto my-2 text-center text-xs">
                Created by{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://www.victorverma.com/"
                    target="_blank"
                >
                    Victor Verma
                </a>{" "}
                | v1.0.1
            </p>
            <div className="w-40 mx-auto flex flex-row justify-around">
                {logos.map((logo, index) => (
                    <a key={index} href={logo.link} target="_blank">
                        <img
                            className="w-5"
                            src={logo.image}
                            alt={logo.alt}
                        ></img>
                    </a>
                ))}
            </div>
            <p className="w-4/5 sm:min-w-96 mx-auto my-2 text-center text-xs">
                Leave{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdRETeDzFE_i6lSv6BunfmSHCdINK5YQKoFAV_8nwog1-A9Qg/viewform?usp=sf_link"
                    target="_blank"
                >
                    suggestions and feedback
                </a>
            </p>
            <p className="w-4/5 sm:min-w-96 mx-auto my-2 text-center text-xs">
                Consider{" "}
                <a
                    className="underline decoration-amber-800 hover:text-amber-800 hover:shadow-md"
                    href="https://ko-fi.com/victorverma"
                    target="_blank"
                >
                    donating
                </a>{" "}
                to help with server costs!
            </p>
            <p className="w-4/5 sm:min-w-96 mx-auto my-2 text-center text-xs">
                *This project uses publicly accessible data and is not
                affiliated with Letterboxd
            </p>
        </div>
    );
};

export default Footer;
