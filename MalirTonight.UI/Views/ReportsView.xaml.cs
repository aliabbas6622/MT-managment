using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class ReportsView : System.Windows.Controls.UserControl
{
    public ReportsView(ReportsViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}
