import { Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

// const ageData = [{ ageGroup: '0 - 5', value: 60 }, { ageGroup: '6 - 17', value: 50 }, {
//   ageGroup: '18 - 24',
//   value: 30,
// }, { ageGroup: '25 - 29', value: 55 }, { ageGroup: '30 - 35', value: 50 }, {
//   ageGroup: '36 - 49',
//   value: 55,
// }, { ageGroup: '50 - 59', value: 70 }, { ageGroup: '60 - 64', value: 40 }, { ageGroup: '65+', value: 40 }];

const AgeDistributionCard = ({ data }) => {
  return (<Card sx={{
    padding: '2rem 1.5rem',
    border: 'solid rgba(108, 115, 108, 0.2)',
    boxShadow: 'unset',
    borderRadius: '1.5rem',
    borderWidth: '0.1rem',
    display: 'flex',
    flexDirection: 'row',
    columnGap: '2rem',
    height: { xs: 'fit-content', md: 'auto' },
  }}>
    <CardContent>
      <Typography variant="h6">Age Distribution</Typography>
      <ResponsiveContainer width="105%" height={300}>
        <BarChart data={data} barCategoryGap="25%" barGap="10%" width={700}>
          <XAxis dataKey="ageGroup" interval={0} tick={{ fontSize: 6.5 }} />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="url(#colorGradient)"
            radius={[10, 10, 0, 0]}
          >
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: '12px', fill: '#333' }}
            />
          </Bar>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B0000" stopOpacity={1} />
              <stop offset="100%" stopColor="#8B0000" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>);
};

export default AgeDistributionCard;
