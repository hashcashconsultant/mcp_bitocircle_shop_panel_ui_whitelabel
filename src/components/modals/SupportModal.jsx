'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useApp } from '@/context/AppContext';

const supportOptions = [
  // {
  //   icon: ChatIcon,
  //   title: '💬 Live Chat',
  //   description: 'Chat with our support team in real-time',
  // },
  {
    icon: ConfirmationNumberIcon,
    title: '🎫 Raise a Ticket',
    description: 'Create a support ticket for detailed assistance',
  },
  {
    icon: EmailIcon,
    title: '✉️ Email Support',
    description: 'contactus@bitocircle.com',
  },
  // {
  //   icon: PhoneIcon,
  //   title: '📞 Phone Support',
  //   description: 'US: 1-800-XXX-XXXX | International: +1-XXX-XXX-XXXX',
  // },
];

export default function SupportModal() {
  const { supportModalOpen, setSupportModalOpen, showToast } = useApp();

  const handleOptionClick = (option) => {
  if (option.title.includes('Ticket')) {
    const brokerId = localStorage.getItem('brokerId');
    const token = localStorage.getItem('access_token_us');

    if (!brokerId || !token) {
      showToast('Missing broker information', 'error');
      return;
    }

    const url = `https://support.paybito.com/brokers/autologin?brokerid=${encodeURIComponent(
      brokerId
    )}&token=${encodeURIComponent(token)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    showToast('Redirecting to support portal...', 'info');
  }

  if (option.title.includes('Email')) {
    window.location.href = 'mailto:support@BitoCircle.com';
  }

  setSupportModalOpen(false);
};


  return (
    <Dialog open={supportModalOpen} onClose={() => setSupportModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Contact Support</Typography>
        <IconButton onClick={() => setSupportModalOpen(false)} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {supportOptions.map((option, index) => (
            <Card
              key={index}
              onClick={() => handleOptionClick(option)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(30, 64, 175, 0.5)',
                },
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {option.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
