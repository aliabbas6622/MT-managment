using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class DashboardView : System.Windows.Controls.UserControl
{
    public DashboardView()
    {
        InitializeComponent();
    }

    public DashboardView(DashboardViewModel viewModel) : this()
    {
        DataContext = viewModel;
    }
}