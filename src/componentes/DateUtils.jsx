// dateUtils.jsx

export const adjustToLocalTime = (dateString) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate;
  };
  
  export const formatDate = (dateString) => {
    const date = adjustToLocalTime(dateString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${day} ${months[monthIndex]} ${year}`;
  };
  