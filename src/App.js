import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Aos from "aos";
import "aos/dist/aos.css";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: url(/config/images/cursor-pointer-santas-32.png), pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: url('../styles/images/cursor-pointer-santas-32.png'), pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledLogoFoodmoon = styled.img`
  align: left;
  width: 15%;
  height: 15%;
`;

export const StyledImg = styled.img`
  background-color: var(--darkboxes);
  padding: 24;
  border-radius: 24;
  border: 4px var(--boxes);
  box-shadow:
		0 0 5px rgba(0, 124, 9, 0.95),
		0 0 10px rgba(0, 124, 9, 0.95),
		0 0 20px rgba(0, 124, 9, 0.95);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
  animation-name: dropFly;
	animation-duration: 1.5s;
    animation-direction: alternate;
    animation-iteration-count: infinite;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    Aos.init({ duration: 1500 });
  }, []);

  return (
    <div className="container-full">
      <s.Container
        flex={1}
        ai={"center"}
      >

        <span className="ir-arriba icon-arrow-up2"><i className="fa fa-arrow-up"></i></span>

        <div className="tpl-snow">
            <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>

        <header>
          
          <div data-aos="fade-down" className="header-grid-container">

            <img className="header-logo" alt={"logo"} src={"/config/images/logo-optimization.png"} />

            <nav className="header-navbar">
                <ul>
                  <li className="header-navbar-text"><a href="#lore">Lore</a></li>
                  <li className="header-navbar-text"><a href="#roadmap">Roadmap</a></li>
                  <li className="header-navbar-text"><a href="#team">Team</a></li>
                  <li className="header-navbar-text"><a href="#faq">FAQ</a></li>
                </ul>
            </nav>
          </div>
          
          <div className="header-mint">
            
              <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
                <s.Container flex={1} jc={"center"} ai={"center"} style={{ transform: "scaleX(-1)" }}>
                  <StyledImg data-aos="fade-left" alt={"example"} src={"/config/images/elf-optimization.jpg"} />
                </s.Container>
                <s.SpacerLarge />
                <s.Container
                  data-aos="zoom-in"
                  flex={2}
                  jc={"center"}
                  ai={"center"}
                  style={{
                    backgroundImage: "url(/config/images/madera-green-optimization.jpg)",
                    backgroundColor: "var(--darkboxes)",
                    padding: 24,
                    borderRadius: 24,
                    border: "4px var(--boxes)",
                    boxShadow: "0px 5px 11px 2px rgba(66, 255, 0, 0.95)",
                    boxShadow: "0 0 5px rgba(59, 225, 0, 0.95)",
                    boxShadow: "0 0 10px rgba(50, 187, 2, 0.95)",
                    boxShadow: "0 0 20px rgba(16, 141, 25, 0.52)",
                  }}
                >
                  <s.TextTitle
                    style={{
                      textAlign: "center",
                      fontSize: 40,
                      fontWeight: "bold",
                      color: "var(--accent-text)",
                    }}
                  >
                    Santa's Gift Pre-Sale <br></br>
                    {data.totalSupply} / 0
                  </s.TextTitle>
                  <s.TextDescription
                    style={{
                      textAlign: "center",
                      color: "var(--primary-text)",
                    }}
                  >
                  </s.TextDescription>
                  <s.SpacerSmall />
                  {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                    <>
                      <s.TextTitle
                        style={{ textAlign: "center", color: "var(--accent-text)" }}
                      >
                        The sale has ended.
                      </s.TextTitle>
                      <s.TextDescription
                        style={{ textAlign: "center", color: "var(--accent-text)" }}
                      >
                        You can still find {CONFIG.NFT_NAME} on
                      </s.TextDescription>
                      <s.SpacerSmall />
                      <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                        {CONFIG.MARKETPLACE}
                      </StyledLink>
                    </>
                  ) : (
                    <>
                      <s.TextTitle
                        style={{ textAlign: "center", color: "var(--accent-text)" }}
                      >
                        Cost 0.3{" "}
                        {CONFIG.NETWORK.SYMBOL}.
                      </s.TextTitle>
                      <s.SpacerXSmall />
                      <s.TextDescription
                        style={{ textAlign: "center", color: "var(--accent-text)" }}
                      >
                        Excluding Gas Fees.
                      </s.TextDescription>
                      <s.SpacerSmall />
                      {blockchain.account === "" ||
                      blockchain.smartContract === null ? (
                        <s.Container ai={"center"} jc={"center"}>
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent-text)",
                            }}
                          >
                            Connect to the {CONFIG.NETWORK.NAME} network
                          </s.TextDescription>
                          <s.SpacerSmall />
                          <StyledButton
                            onClick={(e) => {
                              e.preventDefault();
                              {/*
                              dispatch(connect());
                              getData();
                              */}
                            }}
                          >
                            Coming Soon
                          </StyledButton>
                          {blockchain.errorMsg !== "" ? (
                            <>
                              <s.SpacerSmall />
                              <s.TextDescription
                                style={{
                                  textAlign: "center",
                                  color: "var(--accent-text)",
                                }}
                              >
                                {blockchain.errorMsg}
                              </s.TextDescription>
                            </>
                          ) : null}
                        </s.Container>
                      ) : (
                        <>
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent-text)",
                            }}
                          >
                            {feedback}
                          </s.TextDescription>
                          <s.SpacerMedium />
                          <s.Container ai={"center"} jc={"center"} fd={"row"}>
                            <StyledRoundButton
                              style={{ lineHeight: 0.4 }}
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                decrementMintAmount();
                              }}
                            >
                              -
                            </StyledRoundButton>
                            <s.SpacerMedium />
                            <s.TextDescription
                              style={{
                                textAlign: "center",
                                color: "var(--accent-text)",
                              }}
                            >
                              {mintAmount}
                            </s.TextDescription>
                            <s.SpacerMedium />
                            <StyledRoundButton
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                incrementMintAmount();
                              }}
                            >
                              +
                            </StyledRoundButton>
                          </s.Container>
                          <s.SpacerSmall />
                          <s.Container ai={"center"} jc={"center"} fd={"row"}>
                            <StyledButton
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                {/* 
                                claimNFTs();
                                getData();
                                */}
                              }}
                            >
                              {claimingNft ? "BUSY" : "BUY"}
                            </StyledButton>
                          </s.Container>
                        </>
                      )}
                    </>
                  )}
                  <s.SpacerMedium />
                </s.Container>
                <s.SpacerLarge />
                <s.Container flex={1} jc={"center"} ai={"center"}>
                  <StyledImg
                    data-aos="fade-left"
                    alt={"example"}
                    src={"/config/images/elf-optimization.jpg"}
                  />
                </s.Container>
              </ResponsiveWrapper>
          </div>
        </header>

        <div className="body">
          
          <section id="lore">
            <div className="main-grid-container-lore">
              <div data-aos="fade-right" className="main-lore-text">
                <h1 className="main-lore-title title-1">Santa's Gift</h1>
				<p className="main-lore-paragraph">On Christmas night, Santa Claus was in a rush to deliver all the gifts to every person in the World. 
He was caught on a storm and lost several gifts along the way. The helper elves managed to recover them and now are looking for their rightful owners.
</p>
				<p className="main-lore-paragraph">Santa's gifts are magical; when you open them you will get what you are worthy of depending
on how you behaved this year (Wink Wink). You might get a piece of coal, gold bars
or even a rare diamond. Do you think you conducted well this year? Find it out.
</p>
              </div>
              
              <div data-aos="fade-left" className="main-lore-image">
                <img className="img-lore" alt={"logo"} src={"/config/images/gift-optimization.jpg"} />
              </div>
            </div>

            <div className="main-grid-container-lore2">

              <div data-aos="fade-right" className="main-lore-image image-two">
                <img className="img-lore" alt={"logo"} src={"/config/images/coal-optimization.jpg"} />
              </div>

              <div data-aos="fade-left" className="main-lore2-text">

                <h1 className="main-lore-title title-2">Piece of Coal</h1>
				<p className="main-lore-paragraph">You were naughty this year and you got a piece of coal not a prize? Nothing to worry about, Santa always forgives you can try your luck with another gift and cross your fingers to see if you are lucky enough to get some of the great prizes.</p>
				<p className="main-lore-paragraph">Even if you only got coal, you still have a chance to win a prize as they will be awarded randomly among all the people who got a gift regardless of what it was.</p>
              </div>
              
            </div>

            <div className="main-grid-container-lore new-lore">
              <div data-aos="fade-right" className="main-lore-text">

                <h1 className="main-lore-title title-1">Gold Bars</h1>
				<p className="main-lore-paragraph">On the other hand, if you were a straight arrow and your behavior was without reproach and were lucky to get gold bars, you will be greatly rewarded in Crypto: 2 BNB, so you can buy yourself something nice.</p>
				<p className="main-lore-paragraph">In the future we will release new NFT projects. With this you will enter in future whitelists of those projects, in addition to other benefits to be determined later.</p>
              </div>
              <div data-aos="fade-left" className="main-lore-image">
                <img className="img-lore" alt={"logo"} src={"/config/images/gold-optimization.jpg"} />
              </div>
            </div>

            <div className="main-grid-container-lore2">

              <div data-aos="fade-right" className="main-lore-image image-two">
                <img className="img-lore" alt={"logo"} src={"/config/images/diamond-optimization.jpg"} />
              </div>

              <div data-aos="fade-left" className="main-lore2-text">

                <h1 className="main-lore-title title-2">Big Diamond</h1>
				<p className="main-lore-paragraph">If you were a person of exemplary conduct this year, you may be lucky enough to get a diamond. 
If that’s the case, Congratulations! You will get 6 BNB so you can buy what you always
wanted.
</p>
				<p className="main-lore-paragraph">In the future we will release new NFT projects. With this price, you will enter in future whitelists
of those projects, in addition to other benefits to be determined later.
</p>
              </div>
              
            </div>

          </section>
          
          <section id="roadmap">
          
            <div className="main-grid-container-roadmap">
              <h1 data-aos="zoom-in" className="main-roadmap-title">Roadmap</h1>

              <div className="roadmap">
              <div data-aos="fade-right" className="point">
                <div className="point-index">1</div>
                <div className="point-label">0% Santa's Gift</div>
                <div className="point-text">5000 Gifts are looking for their lucky owner.</div>
              </div>
              <div data-aos="fade-left" className="point">
                <div className="point-index">2</div>
                <div className="point-label">20% Whitelist</div>
                <div className="point-text">You have the chance to join our  whitelist (1000 places available only), to be guaranteed to mint your NFT.</div>
              </div>
              <div data-aos="fade-right" className="point">
                <div className="point-index">3</div>
                <div className="point-label">40% Giveaways</div>
                <div className="point-text">25 Santa's Gifts NFTs will be raffled away to our followers in Discord, Instagram and Twitter.</div>
              </div>
              <div data-aos="fade-left" className="point">
                <div className="point-index">4</div>
                <div className="point-label">60% Incoming Rewards</div>
                <div className="point-text">Also, We will be sending  prizes in BNB,  to our NFT holders through our Pre-Sale and Public Sale.</div>
              </div>
              <div data-aos="fade-right" className="point">
                <div className="point-index">5</div>
                <div className="point-label">80% Instant Rewards</div>
                <div className="point-text">100 Diamond NFT Holders will receive 6 BNB, 
  900 Gold NFT Holders will receive 2 BNB.
We will reveal our NFTs  24 hours after the Public Sale STARTS and we will send your rewards right away. <b>WE DONT NEED TO BE SOLD OUT TO SEND YOUR REWARDS AS MOST PROJECTS DO.</b></div>
              </div>
              <div data-aos="fade-left" className="point">
                <div className="point-index">6</div>
                <div className="point-label">100% NFT holders future</div>
                <div className="point-text">500 Random NFT holders of our community will be whitelist in our next edition and will receive whitelisted places in our partner's projects.</div>
              </div>
            </div>
            </div>
            
          </section>

          <section id="team" className="team content-section main-grid-container-team">
            <div className="container">
              <div className="row text-center">
                <div className="col-md-12">
                  <h2 data-aos="zoom-in" className="main-team-title">Our Team</h2>
                  <h3 data-aos="zoom-in-up" className="caption main-team-text">Meet the people who make awesome stuffs</h3>
                </div>

                <div className="container">
                  <div className="row">

                    <div data-aos="fade-down-right" className="col-md-3">
                      <div className="team-member">
                        <figure className="team-box effect">
                          <img className="img-responsive img-lore" alt={"logo"} src={"/config/images/team1-optimization.jpg"} />
                        </figure>
                        <h4 className="main-team-name">Snowflake</h4>
                        <p className="main-team-role">CEO</p>
                      </div>
                    </div>

                    <div data-aos="fade-down" className="col-md-3">
                      <div className="team-member">
                        <figure className="team-box effect">
                          <img className="img-responsive img-lore" alt={"logo"} src={"/config/images/team2-optimization.jpg"} />
                        </figure>
                        <h4 className="main-team-name">Sparkles</h4>
                        <p className="main-team-role">Developer / Blockchain</p>
                      </div>
                    </div>

                    <div data-aos="fade-down-left" className="col-md-3">
                      <div className="team-member">
                        <figure className="team-box effect">
                          <img className="img-responsive img-lore" alt={"logo"} src={"/config/images/team3-optimization.jpg"} />
                        </figure>
                        <h4 className="main-team-name">Dash</h4>
                        <p className="main-team-role">Graphic Designer</p>
                      </div>
                    </div>

                    <div data-aos="fade-down-left" className="col-md-3">
                      <div className="team-member">
                        <figure className="team-box effect">
                          <img className="img-responsive img-lore" alt={"logo"} src={"/config/images/team4-optimization.jpg"} />
                        </figure>
                        <h4 className="main-team-name">Waffles</h4>
                        <p className="main-team-role">Economist</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="faq-section">
              <div className="faq-title text-center pb-3">
                  <h2 data-aos="zoom-in" className="main-faq-title">FAQ</h2>
              </div>

              <div data-aos="zoom-in-right" className="faq-question">
                <input type="checkbox" id="question1" name="q"  className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question1" className="question">
                What is the total Santas' Gift supply?
                </label>
                <div className="answers">
                  <p>There will be only 5000 Santas' Gift available. 1000 for Pre-Sale and 4000 for Public Sale.</p>
                  
                </div>
              </div>

              <div data-aos="zoom-in-left">
                <input type="checkbox" id="question2" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question2" className="question">
                How much does it cost to mint Santa's Gift?
                </label>
                <div className="answers">
                  <p>Pre-Sale : 0.3 BNB + gas fees.</p>
                  <p>Public Sale: 0.6 BNB + gas fees.</p>
                  
                </div>
              </div>

              <div data-aos="zoom-in-right">
                <input type="checkbox" id="question3" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question3" className="question">
                Where will I be able to mint?
                </label>
                <div className="answers">
                  <p>The minting for the pre-sale and public launch will take place only in our website. You will be able to mint using BNB and a Metamask Wallet. Once minting is completed, you will be able to see your Santas' Gift in your Metamask Wallet and any Binance Smart Chain Marketplace.</p>
                  
                </div>
              </div>
              
              <div data-aos="zoom-in-left">
                <input type="checkbox" id="question4" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question4" className="question">
                When is the Pre-Sale?
                </label>
                <div className="answers">
                  <p>Coming Soon.</p>
                  
                </div>
              </div>
              
              <div data-aos="zoom-in-right">
                <input type="checkbox" id="question5" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question5" className="question">
                When is the Public Sale?
                </label>
                <div className="answers">
                  <p>Coming Soon.</p>
                  
                </div>
              </div>
              
              <div data-aos="zoom-in-left">
                <input type="checkbox" id="question6" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question6" className="question">
                How many NFT can I mint?
                </label>
                <div className="answers">
                  <p>Anyone can mint up to 5 NFT.</p>
                  
                </div>
              </div>
                
              <div data-aos="zoom-in-right">
                <input type="checkbox" id="question7" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question7" className="question">
                Which Blockchain will you use?
                </label>
                <div className="answers">
                  <p>The Binance Smart Chain. Our Santa's elves knows that the BSC is one of the lowest gas fees in the blockchain and they want the best option for you.</p>
                  
                </div>
              </div>

              <div data-aos="zoom-in-left">
                <input type="checkbox" id="question8" name="q" className="questions"/>
                <div className="plus">+</div>
                <label htmlFor="question8" className="question">
                Will there be any giveaways?
                </label>
                <div className="answers">
                  <p>Yes, through our Discord, Twitter and Instagram there will be daily giveaways.</p>
                  
                </div>
              </div>
            </section>

        <footer>
          <div className="contenedor">
            <a target="_blank" href="https://www.instagram.com/santasgift_nft" className="icono-social  redondo" id="instagram"><i className="fa fa-2x fa-instagram" aria-hidden="true"></i></a>
            <a target="_blank" href="https://twitter.com/Santas_GiftNFT" className="icono-social  redondo" id="twitter"><i className="fa fa-2x fa-twitter" aria-hidden="true"></i></a> 
            <a target="_blank" href="https://discord.gg/swhR3YjgMs" className="icono-social  redondo" id="discord"><img src={"/config/images/discord.png"}></img></a>
          </div>

          <img className="footer-logo" alt={"logo"} src={"/config/images/logo-optimization.png"} />
          <p className="footer-text">&copy; 2022 Santa's Gift. All Rights Reserved.</p>
        </footer>
      </div>

    </s.Container>
  </div>
  );
}

export default App;
