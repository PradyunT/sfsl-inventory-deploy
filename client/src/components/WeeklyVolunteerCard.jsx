// WeeklyVolunteerCard.jsx
import SimpleCard from "../components/SimpleCard";
import placeholderimg from "../assets/placeholder-img.jpg";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import toast from "react-hot-toast";

const WeeklyVolunteerCard = () => {
  return (
    <div>
      <SimpleCard
              img={null}
              header="Placeholder"
              mobileHeader="Placeholder"
              number="0"
              trend="+0%"
              description={
                <span className="hidden md:inline">
                  Placeholder
                </span>
              }
              icon={<AccountCircleIcon className="dashboard-card-img" style={{ fontSize: '4rem', color: '#992A1D' }}/>}
            />
    </div>
  );
};

export default WeeklyVolunteerCard;