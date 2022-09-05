import axios from "axios";

type Site = {
  region: string;
  name: string;
  siteId: number;
};

type SiteApiObject = {
  Site_Id: number;
  SiteName: string;
  Longitude: null;
  Latitude: null;
  Region: string;
};

export const getSites = async () => {
  const res = await axios.get(
    "https://data.airquality.nsw.gov.au/api/Data/get_SiteDetails"
  );
  const sites: Site[] = res.data.map((site: SiteApiObject) => ({
    name: site.SiteName.toUpperCase(),
    region: site.Region.toUpperCase(),
    siteId: site.Site_Id,
  }));
  return sites;
};
