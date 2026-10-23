import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Heart, Sparkles, CalendarDays, ArrowUpRight, Star, UserRound } from "lucide-react";
import "./style.css";

const favourites = {
  Actor: [
    { name: "Shah Rukh Khan", dob: "2 November 1965", profession: "Actor", about: "Shah Rukh Khan is a popular Indian actor known for his memorable movies and performances.", initials: "SRK", wiki: "Shah_Rukh_Khan" },
    { name: "Salman Khan", dob: "27 December 1965", profession: "Actor", about: "Salman Khan is a well-known Indian actor who has appeared in many popular Hindi films.", initials: "SK", wiki: "Salman_Khan" },
    { name: "Aamir Khan", dob: "14 March 1965", profession: "Actor", about: "Aamir Khan is an Indian actor and filmmaker known for his work in Hindi cinema.", initials: "AK", wiki: "Aamir_Khan" },
    { name: "Ranbir Kapoor", dob: "28 September 1982", profession: "Actor", about: "Ranbir Kapoor is an Indian actor known for his versatile roles in Hindi films.", initials: "RK", wiki: "Ranbir_Kapoor" },
    { name: "Vicky Kaushal", dob: "16 May 1988", profession: "Actor", about: "Vicky Kaushal is an Indian actor known for a range of acclaimed Hindi film roles.", initials: "VK", wiki: "Vicky_Kaushal" },
    { name: "Allu Arjun", dob: "8 April 1982", profession: "Actor", about: "Allu Arjun is an Indian actor known for his work in Telugu cinema.", initials: "AA", wiki: "Allu_Arjun" }
  ],
  Actress: [
    { name: "Alia Bhatt", dob: "15 March 1993", profession: "Actress", about: "Alia Bhatt is an Indian actress known for her work in Hindi films.", initials: "AB", wiki: "Alia_Bhatt" },
    { name: "Deepika Padukone", dob: "5 January 1986", profession: "Actress", about: "Deepika Padukone is an Indian actress known for her leading roles in popular films.", initials: "DP", wiki: "Deepika_Padukone" },
    { name: "Katrina Kaif", dob: "16 July 1983", profession: "Actress", about: "Katrina Kaif is an actress known for her performances in Hindi cinema.", initials: "KK", wiki: "Katrina_Kaif" },
    { name: "Priyanka Chopra", dob: "18 July 1982", profession: "Actress", about: "Priyanka Chopra is an Indian actress who has worked in Indian and international films.", initials: "PC", wiki: "Priyanka_Chopra" },
    { name: "Kiara Advani", dob: "31 July 1991", profession: "Actress", about: "Kiara Advani is an Indian actress known for her work in Hindi cinema.", initials: "KA", wiki: "Kiara_Advani" },
    { name: "Shraddha Kapoor", dob: "3 March 1987", profession: "Actress", about: "Shraddha Kapoor is an Indian actress known for popular Hindi film roles.", initials: "SK", wiki: "Shraddha_Kapoor" }
  ],
  Cricketer: [
    { name: "Virat Kohli", dob: "5 November 1988", profession: "Cricketer", about: "Virat Kohli is an Indian cricketer known for his batting and competitive spirit.", initials: "VK", wiki: "Virat_Kohli" },
    { name: "MS Dhoni", dob: "7 July 1981", profession: "Cricketer", about: "MS Dhoni is a former Indian cricket captain known for his calm leadership.", initials: "MSD", wiki: "Mahendra_Singh_Dhoni" },
    { name: "Rohit Sharma", dob: "30 April 1987", profession: "Cricketer", about: "Rohit Sharma is an Indian cricketer known for his batting and leadership.", initials: "RS", wiki: "Rohit_Sharma" },
    { name: "Jasprit Bumrah", dob: "6 December 1993", profession: "Cricketer", about: "Jasprit Bumrah is an Indian fast bowler known for his bowling style and accuracy.", initials: "JB", wiki: "Jasprit_Bumrah" },
    { name: "Shubman Gill", dob: "8 September 1999", profession: "Cricketer", about: "Shubman Gill is an Indian cricketer known for his batting across formats.", initials: "SG", wiki: "Shubman_Gill" },
    { name: "Suryakumar Yadav", dob: "14 September 1990", profession: "Cricketer", about: "Suryakumar Yadav is an Indian cricketer known for creative and attacking batting.", initials: "SY", wiki: "Suryakumar_Yadav" }
  ]
};

function App() {
  const [selected, setSelected] = useState({
    Actor: "Shah Rukh Khan",
    Actress: "",
    Cricketer: ""
  });
  const [activeCategory, setActiveCategory] = useState("Actor");
  const [photos, setPhotos] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  const person = favourites[activeCategory].find(
    (item) => item.name === selected[activeCategory]
  );
  const photoKey = person ? `${activeCategory}:${person.name}` : "";
  const photoStatus = photoKey ? photos[photoKey] : undefined;
  const photo = photoStatus?.image || "";

  useEffect(() => {
    const currentStatus = photos[photoKey]?.status;
    if (!person || (currentStatus && currentStatus !== "loading")) return;

    const controller = new AbortController();
    let cancelled = false;
    setPhotos((old) => ({ ...old, [photoKey]: { status: "loading", image: "" } }));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(person.wiki)}`, {
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) throw new Error("Photo not found");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const image = data.originalimage?.source || data.thumbnail?.source || "";
        setPhotos((old) => ({
          ...old,
          [photoKey]: { status: image ? "ready" : "unavailable", image }
        }));
      })
      .catch((error) => {
        if (!cancelled && error.name !== "AbortError") {
          setPhotos((old) => ({ ...old, [photoKey]: { status: "error", image: "" } }));
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [person?.name, person?.wiki, activeCategory, photoKey, retryCount]);

  function handleChange(category, name) {
    setSelected((old) => ({ ...old, [category]: name }));
    setActiveCategory(category);
  }

  function retryPhoto() {
    setPhotos((old) => {
      const next = { ...old };
      delete next[photoKey];
      return next;
    });
    setRetryCount((count) => count + 1);
  }

  return (
    <div className="page">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <header className="header">
        <div className="brand-icon"><Heart size={17} fill="currentColor" /></div>
        <span>My <b>Favourites</b></span>
        <span className="header-tag"><Sparkles size={14} /> PERSONAL COLLECTION</span>
      </header>

      <main>
        <section className="intro">
          <p className="subtitle"><span /> YOUR STARS, YOUR CHOICE <span /></p>
          <h1>Meet your <em>favourites.</em></h1>
          <p className="intro-text">Choose a personality and discover their profile.</p>
        </section>

        <section className="select-section">
          {Object.keys(favourites).map((category) => (
            <div className={`select-box ${activeCategory === category ? "select-active" : ""}`} key={category}>
              <label htmlFor={category}>
                <span className={`category-icon ${category.toLowerCase()}`}>{category === "Actor" ? "🎬" : category === "Actress" ? "✦" : "🏏"}</span>
                {category === "Actor" ? "Favourite Actor" : category === "Actress" ? "Favourite Actress" : "Favourite Cricketer"}
              </label>
              <select
                id={category}
                value={selected[category]}
                onChange={(event) => handleChange(category, event.target.value)}
                onFocus={() => setActiveCategory(category)}
              >
                <option value="">Select {category}</option>
                {favourites[category].map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
              <p className="field-hint">{category === "Actor" ? "Cinema favourites" : category === "Actress" ? "Stars who inspire" : "Cricket legends"}</p>
            </div>
          ))}
        </section>

        <section className="content">
          <div className="photo-card">
            <div className="card-heading">
              <div><span className="eyebrow">01 / PHOTO GALLERY</span><h2>Favourite Photo</h2></div>
              <span className="camera-mark">✧</span>
            </div>
            <div className="photo-frame">
              {photo ? (
                <img
                  src={photo}
                  alt={person?.name || "Favourite personality"}
                  onError={() => setPhotos((old) => ({
                    ...old,
                    [photoKey]: { status: "unavailable", image: "" }
                  }))}
                />
              ) : (
                <div className="photo-placeholder">
                  <div className="placeholder-icon">{photoStatus?.status === "loading" ? <span className="loading-spinner" /> : person?.initials || "✦"}</div>
                  <p aria-live="polite">
                    {photoStatus?.status === "loading"
                      ? "Finding their photo..."
                      : photoStatus?.status === "error"
                        ? "Could not load the photo. Check your connection and try again."
                        : person
                          ? "No photo is available right now."
                          : "Select a favourite above"}
                  </p>
                  {(photoStatus?.status === "error" || photoStatus?.status === "unavailable") && (
                    <button className="retry-button" onClick={retryPhoto}>Try again</button>
                  )}
                </div>
              )}
              <span className="photo-label">{person ? person.profession.toUpperCase() : "YOUR GALLERY"}</span>
            </div>
            <div className="photo-bottom">
              <span>{person ? person.name : "Your selected photo appears here"}</span>
              <span className="photo-dot" />
            </div>
            <p className="photo-note">Photo is fetched from Wikipedia when available.</p>
          </div>

          <div className="details-card">
            <div className="details-top"><p className="details-label">PROFILE DETAILS</p><span className="star-icon"><Star size={15} /></span></div>
            {person ? (
              <>
                <span className="category-tag">{person.profession}</span>
                <h2>{person.name}</h2>
                <div className="accent-line" />
                <p className="description">{person.about}</p>
                <div className="detail-item">
                  <span className="detail-symbol"><UserRound size={16} /></span>
                  <div><small>Profession</small><strong>{person.profession}</strong></div>
                </div>
                <div className="detail-item">
                  <span className="detail-symbol"><CalendarDays size={16} /></span>
                  <div><small>Date of Birth</small><strong>{person.dob}</strong></div>
                </div>
                <button className="more-button" onClick={() => window.open(`https://en.wikipedia.org/wiki/${person.wiki}`, "_blank", "noopener,noreferrer")}>
                  View More Details <ArrowUpRight size={16} />
                </button>
              </>
            ) : (
              <div className="empty-details">
                <div className="empty-star">☆</div>
                <h2>Choose your favourite</h2>
                <p>Select a person from one of the dropdowns above to display their information here.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer><span>My Favourites</span><span>MADE WITH <Heart size={12} fill="currentColor" /> FOR FANS</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
