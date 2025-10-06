import { School } from "@/src/interface/team/interface";

interface SchoolCardInfoProps {
  school: School;
}

const SchoolCardInfo: React.FC<SchoolCardInfoProps> = ({ school }) => {
  return (
    <>
      <div className="flex flex-wrap text-xs items-center my-1">
        <div className="">{school.countrySymbol}</div>
        <div className="profile_dot"></div>
        <div className="">{school.state}</div>
        <div className="profile_dot"></div>
        <div className="flex items-center">
          {" "}
          <i className="bi bi-star-fill text-yellow-500 mr-[2px]"></i>
          4.8
        </div>
        <div className="profile_dot"></div>
        3.5K
        {/* <div className="">{formatDateToDDMMYY(school.createdAt)}</div> */}
      </div>
      <div className="follow_btn">follow</div>
    </>
  );
};

export default SchoolCardInfo;
