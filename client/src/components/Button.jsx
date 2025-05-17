import { styled, ButtonBase } from '@mui/material'


/**
 * Example button component using material UI
 */
const CustomButton = styled(ButtonBase)({
  padding: '12px 16px',
  borderRadius: '20px',
  backgroundColor: '#93da93',
  transition: 'transform 100ms ease',

  '&:hover': {
    backgroundColor: '#a2e1a2',
  },

  '&:active': {
    transform: 'scale(0.96)',
  },
})

export default function Button({ children, ...props }) {
  return <CustomButton {...props}>{children}</CustomButton>
}
